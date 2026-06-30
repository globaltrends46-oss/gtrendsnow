import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Webhook ready - send POST requests to /content-hook with Title, Content, Image_URL. Validate WEBHOOK_SECRET_KEY header.
router.post('/content-hook', async (req, res) => {
  const { title, content, image_url, author, category } = req.body;

  // Validate required fields
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Validate webhook secret
  const webhookSecret = req.headers['webhook_secret_key'];
  if (webhookSecret !== process.env.WEBHOOK_SECRET_KEY) {
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  // Create blog post in PocketBase
  const record = await pb.collection('blog_posts').create({
    title,
    content,
    image_url: image_url || null,
    author: author || null,
    category: category || null,
  });

  logger.info(`Blog post created: ${record.id}`);

  res.json({
    id: record.id,
    message: 'Blog post published',
  });
});

export default router;