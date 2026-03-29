/**
 * BibleFunLand AI Proxy Helper
 * Proxies calls to the secure backend to protect the Anthropic API key.
 */

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export async function generateAIContent({
  system,
  messages,
  model = 'claude-3-5-sonnet-20241022',
  max_tokens = 500,
}) {
  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, messages, model, max_tokens }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'AI Proxy Error');
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  } catch (error) {
    console.error('AI Helper Error:', error);
    throw error;
  }
}
