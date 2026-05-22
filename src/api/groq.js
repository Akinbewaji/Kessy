import { auth } from '../firebase';

async function getToken() {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return null;
}

export async function callClaude(prompt, system) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, system, cost: 1 })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.content;
}

export async function callClaudeStream(prompt, system, onChunk, cost = 10) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, system, stream: true, cost })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'API error');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    
    // Server-sent events stream chunks separated by double newline, or single if partial.
    // data: {"choices":[{"delta":{"content":"foo"}}]}
    
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') break;
        if (!dataStr) continue;
        
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices[0]?.delta?.content || '';
          result += delta;
          if (onChunk) onChunk(result);
        } catch(e) {
          // ignore incomplete json from chunk boundaries
        }
      }
    }
  }
  return result;
}
