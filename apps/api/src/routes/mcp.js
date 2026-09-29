import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';
import { transformGitHubRepoToMcp, updateMcpRegistry } from '../jobs/mcp-registry-updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/mcp_registry.json');
const WEB_DATA_FILE = path.resolve(__dirname, '../../../web/src/data/mcp_registry.json');

const router = Router();

function loadRegistry() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    logger.warn('Failed to read mcp_registry.json:', err.message);
  }
  return [];
}

// In-memory cache for fast search
let registryCache = loadRegistry();

function saveToRegistry(newItems) {
  try {
    const current = loadRegistry();
    const map = new Map();
    for (const item of current) {
      map.set(`${(item.owner || '').toLowerCase()}/${(item.repo || '').toLowerCase()}`, item);
    }
    let added = 0;
    for (const item of newItems) {
      const key = `${(item.owner || '').toLowerCase()}/${(item.repo || '').toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, item);
        added++;
      }
    }
    if (added > 0) {
      const updated = Array.from(map.values()).sort((a, b) => (b.stars || 0) - (a.stars || 0));
      registryCache = updated;
      const jsonStr = JSON.stringify(updated, null, 2);
      fs.writeFileSync(DATA_FILE, jsonStr, 'utf-8');
      if (fs.existsSync(path.dirname(WEB_DATA_FILE))) {
        fs.writeFileSync(WEB_DATA_FILE, jsonStr, 'utf-8');
      }
      logger.info(`💾 Cached ${added} new MCP repositories to persistent registry.`);
    }
  } catch (err) {
    logger.warn('Failed to cache new MCP repositories:', err.message);
  }
}

/**
 * Search GitHub live for user query to discover new MCP repositories on-the-fly
 */
async function searchGitHubLive(query) {
  try {
    const cleanQuery = query.toLowerCase().includes('mcp') ? query : `${query} mcp`;
    const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(cleanQuery)}&sort=stars&order=desc&per_page=15`;
    
    let res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTrendsGlobal/1.0',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 4000
    });

    let items = [];
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) items = data.items;
    }

    // If query + mcp returned 0 results, search raw query directly
    if (items.length === 0 && !query.toLowerCase().includes('mcp')) {
      const fallbackUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=15`;
      const fRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTrendsGlobal/1.0',
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 4000
      });
      if (fRes.ok) {
        const fData = await fRes.json();
        if (Array.isArray(fData.items)) items = fData.items;
      }
    }

    if (items.length > 0) {
      const transformed = items.map(repo => transformGitHubRepoToMcp(repo));
      saveToRegistry(transformed);
      return transformed;
    }
  } catch (err) {
    logger.warn(`Live GitHub MCP search bypassed: ${err.message}`);
  }
  return [];
}

/**
 * GET /mcp - Query, filter, and sort MCP servers & AI repositories
 */
router.get('/', async (req, res) => {
  try {
    const { category, q, sort = 'stars', limit = 100, offset = 0 } = req.query;
    let items = loadRegistry();
    if (items.length > 0) registryCache = items;
    else items = registryCache;

    // Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      items = items.filter(item => 
        item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Natural Language & Keyword Requirement Search
    let recommended = [];
    if (q && q.trim().length > 0) {
      const rawQuery = q.toLowerCase().trim();
      const keywords = rawQuery
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => !['i', 'want', 'to', 'for', 'a', 'an', 'the', 'in', 'and', 'with', 'need', 'how'].includes(w));

      // 1. Score local items
      const scored = items.map(item => {
        let score = 0;
        const textToSearch = `${item.name} ${item.shortDescription} ${item.fullUseCase} ${(item.tags || []).join(' ')} ${item.category}`.toLowerCase();

        if (textToSearch.includes(rawQuery)) score += 10;

        for (const kw of keywords) {
          if (item.name.toLowerCase().includes(kw)) score += 5;
          if ((item.tags || []).some(t => t.toLowerCase().includes(kw))) score += 4;
          if (item.category.toLowerCase().includes(kw)) score += 3;
          if (item.shortDescription.toLowerCase().includes(kw)) score += 2;
        }

        return { item, score };
      });

      let matched = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

      // 2. If matches are few, dynamically search GitHub live
      if (matched.length < 8 && rawQuery.length >= 2) {
        const liveItems = await searchGitHubLive(rawQuery);
        for (const lItem of liveItems) {
          if (!matched.some(m => m.item.id === lItem.id || m.item.repo === lItem.repo)) {
            matched.push({ item: lItem, score: 6 });
          }
        }
        matched.sort((a, b) => b.score - a.score);
      }

      items = matched.map(m => m.item);

      // Top 3 highest scoring items become "Recommended for this need"
      if (matched.length > 0 && matched[0].score >= 4) {
        recommended = matched.slice(0, 3).map(m => m.item);
      }
    }

    // Sorting
    if (sort === 'downloads') {
      items.sort((a, b) => {
        const getNum = s => parseFloat(s) * (String(s).includes('M') ? 1000000 : 1000);
        return getNum(b.downloads) - getNum(a.downloads);
      });
    } else if (sort === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: sort by Stars
      items.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    }

    const total = items.length;
    const paginated = items.slice(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10));

    res.json({
      success: true,
      total,
      recommended,
      items: paginated
    });
  } catch (err) {
    logger.error('Failed to list MCP registry:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /mcp/trending - Top 50 trending repositories
 */
router.get('/trending', (req, res) => {
  try {
    const items = loadRegistry().sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 50);
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /mcp/refresh - Trigger manual 12-hour sync from GitHub
 */
router.post('/refresh', async (req, res) => {
  try {
    const items = await updateMcpRegistry(logger);
    res.json({ success: true, count: items.length, message: 'MCP registry updated from live GitHub search' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /mcp/:id - Get detailed use case and configuration for single item
 */
router.get('/:id', (req, res) => {
  try {
    const items = loadRegistry();
    const item = items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'MCP item not found' });
    }
    res.json({ success: true, item });
  } catch (err) {
    logger.error('Failed to get MCP item:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /mcp/download/:id - 1-Click ZIP Download direct streaming
 */
router.get('/download/:id', async (req, res) => {
  try {
    const items = loadRegistry();
    const item = items.find(i => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found for download' });
    }

    const zipUrls = [
      `https://github.com/${item.owner}/${item.repo}/archive/refs/heads/main.zip`,
      `https://github.com/${item.owner}/${item.repo}/archive/refs/heads/master.zip`,
      item.downloadUrl
    ].filter(Boolean);

    logger.info(`📦 Streaming direct 1-click ZIP download for [${item.name}]...`);

    let response = null;
    for (const url of zipUrls) {
      try {
        const streamRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) GTrendsGlobal/1.0',
            'Accept': 'application/vnd.github.v3.raw, application/octet-stream, application/zip'
          },
          timeout: 10000
        });

        if (streamRes.ok) {
          response = streamRes;
          break;
        }
      } catch (err) {
        logger.warn(`Download attempt failed at [${url}]:`, err.message);
      }
    }

    if (response && response.ok) {
      const safeFileName = `${(item.repo || item.id).replace(/[^a-zA-Z0-9._-]/g, '')}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
      
      const contentLength = response.headers.get('content-length');
      if (contentLength) res.setHeader('Content-Length', contentLength);

      return response.body.pipe(res);
    }

    // Fallback: redirect directly to primary zip download URL if streaming encounters rate-limiting
    res.redirect(item.downloadUrl || `https://github.com/${item.owner}/${item.repo}/archive/refs/heads/main.zip`);
  } catch (err) {
    logger.error('Failed to stream MCP repository download:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
