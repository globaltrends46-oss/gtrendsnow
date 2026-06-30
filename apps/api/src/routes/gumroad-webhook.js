import 'dotenv/config';
import express from 'express';
import { appendFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const logFilePath = resolve(__dirname, '../../webhook_log.txt');

/**
 * Log webhook event to webhook_log.txt
 */
function logWebhookEvent(email, action, success, details = '') {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  const logEntry = `[${timestamp}] ${status} | Email: ${email} | Action: ${action} | ${details}\n`;
  
  try {
    appendFileSync(logFilePath, logEntry);
  } catch (error) {
    logger.error('Failed to write to webhook_log.txt:', error.message);
  }
}

// POST /gumroad-webhook - Handle Gumroad purchase notifications
router.post('/', async (req, res) => {
  const { email, product_id, license_key, charge_id } = req.body;

  logger.info('📦 Gumroad webhook received', {
    email,
    productId: product_id,
    chargeId: charge_id,
  });

  // Return 200 OK even if email is missing (Gumroad expects 200)
  if (!email) {
    logger.warn('⚠️ Gumroad webhook: Missing email in request body');
    logWebhookEvent('UNKNOWN', 'webhook_received', false, 'Missing email in request body');
    return res.status(200).json({ success: true, message: 'Webhook received' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    logger.info('🔍 Checking for existing VIP user', { email: normalizedEmail });

    // Check if user already exists
    let existingUser = null;
    try {
      existingUser = await pb.collection('vip_users').getFirstListItem(`email="${normalizedEmail}"`);
      logger.info('✅ Existing VIP user found', { userId: existingUser.id });
    } catch (error) {
      if (error.message.includes('Failed to find record')) {
        logger.info('ℹ️ No existing VIP user found, will create new record', { email: normalizedEmail });
      } else {
        throw error;
      }
    }

    // Create or update VIP user
    let record;
    if (existingUser) {
      logger.info('📝 Updating existing VIP user', { email: normalizedEmail, userId: existingUser.id });
      record = await pb.collection('vip_users').update(existingUser.id, {
        email: normalizedEmail,
        status: 'active',
      });
      logger.info('✅ VIP user updated', { userId: record.id, email: normalizedEmail });
      logWebhookEvent(normalizedEmail, 'updated', true, `User ID: ${record.id}`);
    } else {
      logger.info('✨ Creating new VIP user', { email: normalizedEmail });
      record = await pb.collection('vip_users').create({
        email: normalizedEmail,
        status: 'active',
      });
      logger.info('✅ VIP user created', { userId: record.id, email: normalizedEmail });
      logWebhookEvent(normalizedEmail, 'inserted', true, `User ID: ${record.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'VIP user activated',
      userId: record.id,
      email: normalizedEmail,
    });
  } catch (error) {
    logger.error('❌ Gumroad webhook processing failed', {
      error: error.message,
      email: normalizedEmail,
    });
    logWebhookEvent(normalizedEmail, 'webhook_process', false, `Error: ${error.message}`);
    throw error;
  }
});

export default router;