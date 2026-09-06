import { Router } from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = Router();

// Comprehensive In-Memory Analytics Store
const memoryAnalytics = {
  totalViews: 0,
  totalClicks: 0,
  dailyViews: {},
  pageCounts: {},
  countryCounts: {},
  keywordCounts: {},
  referrerCounts: {},
  clickEvents: {},
  recentHits: []
};

// Extract search keywords from referrer or URL
function extractKeywords(referrerUrl, pagePath) {
  try {
    if (!referrerUrl) return null;
    const urlObj = new URL(referrerUrl);
    const searchParams = urlObj.searchParams;
    const searchTerms = searchParams.get('q') || searchParams.get('query') || searchParams.get('utm_term');
    if (searchTerms) return searchTerms.toLowerCase();
    
    if (urlObj.hostname.includes('google')) return 'google search (organic)';
    if (urlObj.hostname.includes('bing')) return 'bing search (organic)';
    if (urlObj.hostname.includes('t.co') || urlObj.hostname.includes('twitter')) return 'x/twitter referral';
    if (urlObj.hostname.includes('linkedin')) return 'linkedin referral';
    if (urlObj.hostname.includes('facebook')) return 'facebook referral';
  } catch (e) {}

  if (pagePath.startsWith('/article/')) {
    const slug = pagePath.replace('/article/', '').replace(/-/g, ' ');
    return slug;
  }
  if (pagePath.startsWith('/blog/')) {
    const slug = pagePath.replace('/blog/', '').replace(/-/g, ' ');
    return slug;
  }
  return null;
}

// Track Pageview Endpoint
router.post('/track', async (req, res) => {
  try {
    const { path, title, referrer, eventType, eventLabel } = req.body || {};
    const pagePath = path || '/';
    const today = new Date().toISOString().split('T')[0];

    // Country detection via Hostinger / Cloudflare headers with IP fallback
    const country = req.headers['cf-ipcountry'] || req.headers['x-country'] || req.headers['x-user-country'] || 'US';

    if (eventType === 'click') {
      memoryAnalytics.totalClicks += 1;
      const clickKey = eventLabel || pagePath;
      memoryAnalytics.clickEvents[clickKey] = (memoryAnalytics.clickEvents[clickKey] || 0) + 1;
      return res.json({ success: true, totalClicks: memoryAnalytics.totalClicks });
    }

    memoryAnalytics.totalViews += 1;
    memoryAnalytics.dailyViews[today] = (memoryAnalytics.dailyViews[today] || 0) + 1;
    memoryAnalytics.pageCounts[pagePath] = (memoryAnalytics.pageCounts[pagePath] || 0) + 1;
    memoryAnalytics.countryCounts[country] = (memoryAnalytics.countryCounts[country] || 0) + 1;

    const refDomain = referrer ? (referrer.split('/')[2] || referrer) : 'Direct / Organic';
    memoryAnalytics.referrerCounts[refDomain] = (memoryAnalytics.referrerCounts[refDomain] || 0) + 1;

    const keyword = extractKeywords(referrer, pagePath);
    if (keyword) {
      memoryAnalytics.keywordCounts[keyword] = (memoryAnalytics.keywordCounts[keyword] || 0) + 1;
    }

function anonymizeIp(ip) {
  if (!ip) return '0.0.0.0';
  const cleanIp = String(ip).trim();
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.');
    if (parts.length === 4) parts[3] = 'xxx';
    return parts.join('.');
  }
  if (cleanIp.includes(':')) {
    const parts = cleanIp.split(':');
    return parts.slice(0, 3).join(':') + '::xxxx';
  }
  return 'anonymized';
}

    const hit = {
      path: pagePath,
      title: title || pagePath,
      country: country,
      referrer: refDomain,
      keyword: keyword || 'direct',
      ip: anonymizeIp(req.ip || req.headers['x-forwarded-for']),
      timestamp: new Date().toISOString()
    };

    memoryAnalytics.recentHits.unshift(hit);
    if (memoryAnalytics.recentHits.length > 100) {
      memoryAnalytics.recentHits.pop();
    }

    // Persist to PocketBase if available
    try {
      await pb.collection('page_views').create(hit, { $autoCancel: false });
    } catch (e) {}

    res.json({ success: true, totalViews: memoryAnalytics.totalViews });
  } catch (err) {
    logger.warn('Analytics tracking error:', err.message);
    res.json({ success: false });
  }
});

// Full Analytics Report Endpoint (Sanitized - Zero Personal Data)
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let pbViewsToday = memoryAnalytics.dailyViews[today] || 0;
    let pbViewsYesterday = memoryAnalytics.dailyViews[yesterdayDate] || 0;
    let totalViews = memoryAnalytics.totalViews;

    try {
      const pbRecords = await pb.collection('page_views').getList(1, 500, {
        sort: '-created',
        $autoCancel: false
      });
      if (pbRecords.items.length > 0) {
        totalViews = Math.max(totalViews, pbRecords.totalItems);
      }
    } catch (e) {}

    res.json({
      success: true,
      summary: {
        totalViews,
        totalClicks: memoryAnalytics.totalClicks,
        viewsToday: pbViewsToday,
        viewsYesterday: pbViewsYesterday
      },
      topPages: Object.entries(memoryAnalytics.pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([p, count]) => ({ path: p, views: count })),
      topCountries: Object.entries(memoryAnalytics.countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([c, count]) => ({ country: c, views: count })),
      topKeywords: Object.entries(memoryAnalytics.keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k, count]) => ({ keyword: k, hits: count })),
      topReferrers: Object.entries(memoryAnalytics.referrerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([r, count]) => ({ referrer: r, views: count })),
      topClickEvents: Object.entries(memoryAnalytics.clickEvents)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, count]) => ({ event: label, clicks: count })),
      recentHits: memoryAnalytics.recentHits.slice(0, 5).map(h => ({
        path: h.path,
        title: h.title,
        country: h.country,
        referrer: h.referrer,
        keyword: h.keyword,
        timestamp: h.timestamp
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve analytics summary' });
  }
});

export default router;
