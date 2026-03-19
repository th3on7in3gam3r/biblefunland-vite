/**
 * email.js — Client helper for sending emails via Resend proxy
 */

export async function sendEmail({ to, subject, html, text }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  
  try {
    const response = await fetch(`${API_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return data;
  } catch (err) {
    console.error('Email Proxy Error:', err);
    throw err;
  }
}
