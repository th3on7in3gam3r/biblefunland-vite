const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post('/chat', async (req, res) => {
  const { messages, system, model = 'claude-3-5-sonnet-20241022', max_tokens = 1000 } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured on server' });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  try {
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
