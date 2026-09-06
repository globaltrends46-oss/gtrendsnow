import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/mcp_registry.json');

/**
 * Scheduled job to update star counts and discover new MCP repositories daily
 */
export async function updateMcpRegistry(loggerInstance = null) {
  const activeLogger = loggerInstance || logger;
  activeLogger.info('🚀 Starting Daily MCP Registry & GitHub Star Rank Updater...');

  if (!fs.existsSync(DATA_FILE)) {
    activeLogger.warn('MCP registry file not found, skipping daily star update.');
    return;
  }

  let items = [];
  try {
    items = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    activeLogger.error('Failed to parse mcp_registry.json:', err.message);
    return;
  }

  let updatedCount = 0;
  // Update star counts for top entries with a friendly rate-limited loop
  for (let i = 0; i < Math.min(items.length, 12); i++) {
    const item = items[i];
    try {
      const res = await fetch(`https://api.github.com/repos/${item.owner}/${item.repo}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 GTrendsGlobal/1.0',
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 5000
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stargazers_count && typeof data.stargazers_count === 'number') {
          item.stars = data.stargazers_count;
          item.lastUpdated = new Date().toISOString();
          updatedCount++;
        }
      }
      // Small 300ms pause to respect public GitHub rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      activeLogger.warn(`Star update bypassed for ${item.name}:`, err.message);
    }
  }

  // Sort by updated stars
  items.sort((a, b) => (b.stars || 0) - (a.stars || 0));

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
    activeLogger.info(`✅ MCP Registry refreshed: ${updatedCount} items updated with live GitHub star counts.`);
  } catch (err) {
    activeLogger.error('Failed to save updated MCP registry:', err.message);
  }
}

export default updateMcpRegistry;
