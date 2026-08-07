import { Router } from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = Router();

// In-memory analytics store fallback for high availability
const memoryAnalytics = {
  totalViews: 0,
  dailyViews: {},
  pageCounts: {},
  recentHits: []
};

// Track page view endpoint
router.post('/track', async (req, res) => {
  try {
    const { path, title, referrer } = req.body || {};
    const pagePath = path || '/';
    const today = new Date().toISOString().split('T')[0];

    memoryAnalytics.totalViews += 1;
    memoryAnalytics.dailyViews[today] = (memoryAnalytics.dailyViews[today] || 0) + 1;
    memoryAnalytics.pageCounts[pagePath] = (memoryAnalytics.pageCounts[pagePath] || 0) + 1;

    const hit = {
      path: pagePath,
      title: title || pagePath,
      referrer: referrer || 'direct',
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
      timestamp: new Date().toISOString()
    };

    memoryAnalytics.recentHits.unshift(hit);
    if (memoryAnalytics.recentHits.length > 100) {
      memoryAnalytics.recentHits.pop();
    }

    // Try creating PocketBase collection record if available
    try {
      await pb.collection('page_views').create(hit, { $autoCancel: false });
    } catch (e) {
      // Fallback silently if PocketBase collection doesn't exist yet
    }

    res.json({ success: true, totalViews: memoryAnalytics.totalViews });
  } catch (err) {
    logger.warn('Analytics tracking error:', err.message);
    res.json({ success: false });
  }
});

// Stats query endpoint
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let pbViewsToday = memoryAnalytics.dailyViews[today] || 0;
    let pbViewsYesterday = memoryAnalytics.dailyViews[yesterdayDate] || 0;
    let totalViews = memoryAnalytics.totalViews;

    try {
      const pbRecords = await pb.collection('page_views').getList(1, 200, {
        sort: '-created',
        $autoCancel: false
      });
      if (pbRecords.items.length > 0) {
        totalViews = Math.max(totalViews, pbRecords.totalItems);
      }
    } catch (e) {}

    res.json({
      success: true,
      totalViews,
      viewsToday: pbViewsToday,
      viewsYesterday: pbViewsYesterday,
      topPages: Object.entries(memoryAnalytics.pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([p, count]) => ({ path: p, views: count })),
      recentHits: memoryAnalytics.recentHits.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
