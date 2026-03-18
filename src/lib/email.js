/**
 * email.js — Client helper for sending emails via Resend proxy
 */

export async function sendEmail({ to, subject, html, text }) {
  try {
    const response = await fetch('http://localhost:3001/api/email/send', {
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
