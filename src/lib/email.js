/**
 * BibleFunLand Email Proxy Helper
 * Proxies calls to the secure backend to protect the Resend API key.
 */

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export async function sendEmail({ to, subject, html, text }) {
  try {
    const response = await fetch(`${API_URL}/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email Proxy Error');
    }

    return await response.json();
  } catch (error) {
    console.error('Email Helper Error:', error);
    throw error;
  }
}
