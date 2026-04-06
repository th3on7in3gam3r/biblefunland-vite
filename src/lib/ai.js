/**
 * BibleFunLand AI Proxy Helper
 * Proxies calls to the secure backend to protect the Anthropic API key.
 */

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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

    // Read body as text first — avoids JSON parse crash on empty/HTML responses
    const text = await response.text();

    if (!response.ok) {
      let msg = `AI request failed (${response.status})`;
      try { msg = JSON.parse(text)?.error || msg; } catch {}
      throw new Error(msg);
    }

    let data;
    try { data = JSON.parse(text); } catch {
      throw new Error('AI server returned an unexpected response. Please try again.');
    }

    return data.content?.[0]?.text || '';
  } catch (error) {
    console.error('AI Helper Error:', error);
    throw error;
  }
}
