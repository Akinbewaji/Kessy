import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import HTMLtoDOCX from 'html-to-docx';

dotenv.config();

admin.initializeApp({
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, system, stream, cost = 1 } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    const uid = decodedToken.uid;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    // Check credits via Firestore REST API using the user's own token
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
    const fsRes = await fetch(firestoreUrl, {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    
    if (!fsRes.ok) {
      return res.status(403).json({ error: 'Forbidden: Could not verify user profile' });
    }
    
    const fsData = await fsRes.json();
    const credits = parseInt(fsData.fields?.credits?.integerValue || 0, 10);
    const role = fsData.fields?.role?.stringValue || 'user';
    
    let canBypass = false;
    if (role === 'admin') {
      canBypass = true;
    } else if (role !== 'user') {
      // Check custom role permissions
      const roleUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/roles/${role}`;
      const roleRes = await fetch(roleUrl, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        if (roleData.fields?.canBypassCredits?.booleanValue === true) {
          canBypass = true;
        }
      }
    }
    
    if (!canBypass && credits < cost) {
      return res.status(403).json({ error: 'Forbidden: Insufficient credits. Please top up your balance.' });
    }

    // Deduct credits atomically via commit REST API (only if not bypassing)
    if (!canBypass) {
      const firestoreCommitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
      const commitRes = await fetch(firestoreCommitUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${idToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          writes: [
            {
              transform: {
                document: `projects/${projectId}/databases/(default)/documents/users/${uid}`,
                fieldTransforms: [
                  {
                    fieldPath: 'credits',
                    increment: { integerValue: -cost }
                  }
                ]
              }
            }
          ]
        })
      });

      if (!commitRes.ok) {
        console.error("Failed to deduct credits", await commitRes.text());
        return res.status(500).json({ error: 'Internal Server Error: Failed to deduct credits' });
      }
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: missing API key' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: stream ? 2000 : 1000,
        stream: !!stream,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API error');
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } else {
      const data = await response.json();
      res.json({ content: data.choices[0].message.content });
    }
  } catch (error) {
    console.error('Error calling Groq:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.post('/api/export-docx', async (req, res) => {
  try {
    const { html, title } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(idToken);
    
    const htmlWithStructure = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
    
    const fileBuffer = await HTMLtoDOCX(htmlWithStructure, null, {
      title: title || 'Manuscript',
      font: 'Times New Roman',
      fontSize: 24, // 12pt
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins (1440 twips)
    });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title || 'Manuscript')}.docx"`);
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Error exporting DOCX:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
