const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/send', async (req, res) => {
  const { from, to, subject, html, text } = req.body;

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Resend API key not configured on server' });
  }

  try {
    const data = await resend.emails.send({
      from: from || 'BibleFunLand <onboarding@resend.dev>',
      to,
      subject,
      html: html || text,
    });
    res.json(data);
  } catch (err) {
    console.error('[Email Proxy Error]', err);
    res.status(500).json({ 
      error: err.message || 'Failed to send email' 
    });
  }
});

module.exports = router;
