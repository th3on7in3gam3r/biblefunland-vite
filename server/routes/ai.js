const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { messages, system, model = 'claude-3-5-sonnet-20241022', max_tokens = 1000 } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ 
      error: 'AI service not configured. Please add ANTHROPIC_API_KEY to your environment variables in Vercel.' 
    });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
    // Lazy-load Anthropic to avoid crash if package missing
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system,
      messages,
    });
    res.json(response);
  } catch (err) {
    console.error('[AI Proxy Error]', err.message);
    res.status(err.status || 500).json({ 
      error: err.message || 'Failed to communicate with AI provider' 
    });
  }
});

module.exports = router;
