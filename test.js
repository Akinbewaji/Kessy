
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

async function test() {
  const prompt = `Write a highly descriptive, comma-separated visual prompt for an AI image generator (like Midjourney or DALL-E) to create a book cover for this story.
      
Genre: Mafia Dark Romance
Setting: Chicago
Core Conflict: Enemies to lovers
Hero: Lorenzo (Alpha male)
Heroine: Isabella (Innocent)
User's specific cover idea: None provided, use best judgment based on genre

The prompt should focus on the aesthetic, mood, lighting, and visual elements. Do not include any text, typography, or titles in the image prompt. Focus purely on the art.
Return ONLY the prompt string, nothing else.`;

  const system = `You are an expert AI art prompt engineer. You output only raw, highly-detailed prompt strings optimized for cinematic, moody dark romance book covers.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await res.json();
  console.log(data.choices[0].message.content);
}

test();
