import express from 'express';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const router = express.Router();
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Affiliate redirect ready - update links in affiliateConfig.json
router.get('/redirect', (req, res) => {
  const { affiliate } = req.query;

  if (!affiliate) {
    return res.status(400).json({ error: 'Affiliate parameter is required' });
  }

  try {
    // Load affiliate config from apps/web/src/config/affiliateConfig.json
    const configPath = resolve(__dirname, '../../web/src/config/affiliateConfig.json');
    const configData = readFileSync(configPath, 'utf-8');
    const affiliateConfig = JSON.parse(configData);

    // Check if affiliate key exists in config
    if (!affiliateConfig[affiliate]) {
      return res.status(400).json({ error: 'Affiliate key not found' });
    }

    const redirectUrl = affiliateConfig[affiliate].link;

    if (!redirectUrl) {
      return res.status(400).json({ error: 'Redirect URL not configured for this affiliate' });
    }

    logger.info(`Redirecting affiliate: ${affiliate} to ${redirectUrl}`);

    // Return 302 redirect response
    res.redirect(302, redirectUrl);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.error('affiliateConfig.json not found');
      throw new Error('Affiliate configuration file not found');
    }
    throw error;
  }
});

export default router;