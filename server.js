import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import HTMLtoDOCX from 'html-to-docx';
import nodemailer from 'nodemailer';

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
        max_tokens: stream ? 2000 : 3000,
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

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, cost = 1, seed } = req.body;
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

    // Check credits
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;
    const fsRes = await fetch(firestoreUrl, {
      headers: { 'Authorization': `Bearer ${idToken}` }
    });
    
    if (!fsRes.ok) return res.status(403).json({ error: 'Forbidden' });
    
    const fsData = await fsRes.json();
    const credits = parseInt(fsData.fields?.credits?.integerValue || 0, 10);
    const role = fsData.fields?.role?.stringValue || 'user';
    
    let canBypass = false;
    if (role === 'admin') canBypass = true;
    else if (role !== 'user') {
      const roleUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/roles/${role}`;
      const roleRes = await fetch(roleUrl, { headers: { 'Authorization': `Bearer ${idToken}` } });
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        if (roleData.fields?.canBypassCredits?.booleanValue === true) canBypass = true;
      }
    }
    
    if (!canBypass && credits < cost) {
      return res.status(403).json({ error: 'Forbidden: Insufficient credits for image.' });
    }

    if (!canBypass) {
      const commitRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writes: [{ transform: { document: `projects/${projectId}/databases/(default)/documents/users/${uid}`, fieldTransforms: [{ fieldPath: 'credits', increment: { integerValue: -cost } }] } }]
        })
      });
      if (!commitRes.ok) return res.status(500).json({ error: 'Failed to deduct credits' });
    }

    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing Stability API Key' });

    const engineId = 'stable-diffusion-v1-6';
    const response = await fetch(`https://api.stability.ai/v1/generation/${engineId}/text-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 768,
        width: 512,
        samples: 1,
        steps: 30,
        ...(seed && { seed: parseInt(seed, 10) })
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Stability API error');
    }

    const responseJSON = await response.json();
    const base64Image = responseJSON.artifacts[0].base64;
    res.json({ base64: base64Image });

  } catch (error) {
    console.error('Error generating image:', error);
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

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmails = process.env.ADMIN_EMAIL || 'digitalkessy350@gmail.com,akintomiwabewaji@gmail.com';

    if (!smtpUser || !smtpPass) {
      console.warn('Warning: SMTP credentials are not configured in environment variables.');
      return res.status(503).json({ 
        error: 'Email service is currently offline. Please contact the administrator directly.' 
      });
    }

    // Configure Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"${name}" <${smtpUser}>`,
      replyTo: email,
      to: adminEmails,
      subject: `[DigitalKessy Contact] New Message from ${name}`,
      text: `You have received a new contact message from your website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
          <h2 style="color: #8b5cf6; margin-top: 0;">New Contact Form Submission</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #8b5cf6; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap; color: #334155;">${message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 0.8rem; color: #64748b; text-align: center; margin: 0;">This email was sent from the DigitalKessy contact form.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Your message has been sent successfully!' });

  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: error.message || 'Failed to send your message. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
