import { Router } from 'express';
import contentStore from '../utils/contentStore.js';
import { trendjackingPublisher, dailyBlogPublisher } from '../jobs/daily-blog-publisher.js';
import logger from '../utils/logger.js';
import pb from '../utils/pocketbaseClient.js';

const router = Router();

let lastAutoPublishCheck = 0;

// GET /posts - Fetch list of articles / blog posts
router.get('/', (req, res) => {
  try {
    const category = req.query.category || null;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const result = contentStore.getPosts({ category, limit, offset });

    // Background Smart Auto-Publisher (Runs at most once every 30 mins)
    const now = Date.now();
    if (now - lastAutoPublishCheck > 30 * 60 * 1000) {
      lastAutoPublishCheck = now;
      const latestPost = result.items?.[0];
      const sixHoursMs = 6 * 60 * 60 * 1000;
      if (!latestPost || (now - new Date(latestPost.published_date).getTime() > sixHoursMs)) {
        logger.info('⏰ Auto-publishing trigger: Latest post is >6 hours old, generating fresh trendjacking article in background...');
        trendjackingPublisher(pb, logger).catch(err => logger.warn('Auto-publish failed:', err.message));
      }
    }

    res.json({
      success: true,
      category: category || 'all',
      total: result.total,
      items: result.items
    });
  } catch (err) {
    logger.error('Failed to get posts:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /posts/:id - Fetch single post
router.get('/:id', (req, res) => {
  try {
    const post = contentStore.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, item: post });
  } catch (err) {
    logger.error('Failed to get post by id:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /posts/trigger-trendjacking - Manually trigger immediate trendjacking generation
router.all('/trigger-trendjacking', async (req, res) => {
  logger.info('⚡ Manual trigger received for trendjacking article');
  try {
    const newPost = await trendjackingPublisher(pb, logger);
    res.json({
      success: true,
      message: 'Trendjacking article published successfully!',
      post: newPost
    });
  } catch (err) {
    logger.error('Failed to publish trendjacking article:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /posts/trigger-daily-blog - Manually trigger category blog generation
router.all('/trigger-daily-blog', async (req, res) => {
  const category = req.query.category || req.body?.category || null;
  logger.info(`⚡ Manual trigger received for daily blog [${category || 'all'}]`);
  try {
    await dailyBlogPublisher(pb, logger, category);
    res.json({
      success: true,
      message: `Daily blog published for category: ${category || 'all'}`
    });
  } catch (err) {
    logger.error('Failed to publish daily blog:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
