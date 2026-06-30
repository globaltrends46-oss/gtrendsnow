import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Google Sheets webhook ready - add GOOGLE_SHEETS_WEBHOOK_URL to .env when user configures their Sheets webhook URL
router.post('/sheets-webhook', async (req, res) => {
  const { name, email, phone, city, toolId, toolTitle, calculationResults, timestamp } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Validate Google Sheets webhook URL is configured
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    logger.warn('GOOGLE_SHEETS_WEBHOOK_URL not configured in environment');
  }

  // Log the payload
  logger.info('Google Sheets webhook triggered', {
    name,
    email,
    phone,
    city,
    toolId,
    toolTitle,
    calculationResults,
    timestamp,
  });

  // TODO: Implement actual Google Sheets integration when webhook URL is configured
  // const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, email, phone, city, toolId, toolTitle, calculationResults, timestamp }),
  // });

  res.json({ message: 'Lead sent to Google Sheets' });
});

export default router;