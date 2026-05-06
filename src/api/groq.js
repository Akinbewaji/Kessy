export async function callClaude(prompt, system) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, system })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API error');
  return data.content;
}
