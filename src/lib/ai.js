/**
 * ai.js — Client helper for AI features
 *
 * Calls our secure backend proxy instead of calling Anthropic directly.
 */

export async function generateAIContent(topic, systemPrompt, model = 'claude-3-5-sonnet-20240620') {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  
  try {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: topic }],
        system: systemPrompt,
        model
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    return data.content?.[0]?.text || '';
  } catch (err) {
    console.error('AI Proxy Error:', err);
    throw err;
  }
}
