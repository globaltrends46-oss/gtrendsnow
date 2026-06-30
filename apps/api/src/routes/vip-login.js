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
 * Log login attempt to webhook_log.txt
 */
function logLoginAttempt(email, success, result = '') {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  const logEntry = `[${timestamp}] LOGIN ${status} | Email: ${email} | ${result}\n`;
  
  try {
    appendFileSync(logFilePath, logEntry);
  } catch (error) {
    logger.error('Failed to write to webhook_log.txt:', error.message);
  }
}

// POST /vip-login - VIP login endpoint
router.post('/', async (req, res) => {
  const { email } = req.body;

  // ============================================================
  // STEP 1: Log incoming request
  // ============================================================
  logger.info('\n' + '='.repeat(70));
  logger.info('🔐 VIP LOGIN ENDPOINT: POST /vip-login request received');
  logger.info('='.repeat(70));
  logger.info('⏰ Timestamp:', new Date().toISOString());
  logger.info('📨 Request Body:', { email });
  logger.info('📍 Endpoint: POST /hcgi/api/vip-login');

  // ============================================================
  // STEP 2: Validate email parameter
  // ============================================================
  logger.info('\n📋 STEP 1: Validating email parameter');
  logger.info('  Checking if email is provided in request body...');
  
  if (!email) {
    logger.warn('  ❌ Email is missing from request body');
    logger.warn('  Returning 400 Bad Request');
    logLoginAttempt('UNKNOWN', false, 'Missing email parameter');
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  logger.info('  ✅ Email parameter found:', email);

  // ============================================================
  // STEP 3: Normalize email
  // ============================================================
  logger.info('\n📋 STEP 2: Normalizing email');
  const normalizedEmail = email.trim().toLowerCase();
  logger.info('  Original email:', email);
  logger.info('  Normalized email:', normalizedEmail);
  logger.info('  ✅ Email normalized successfully');

  // ============================================================
  // STEP 4: Query PocketBase vip_users collection
  // ============================================================
  logger.info('\n📋 STEP 3: Querying PocketBase vip_users collection');
  logger.info('  Collection: vip_users');
  logger.info('  Filter: email="' + normalizedEmail + '"');
  logger.info('  Method: getFirstListItem()');
  logger.info('  Attempting to find VIP user with email:', normalizedEmail);

  try {
    logger.info('  📡 Sending query to PocketBase...');
    const record = await pb.collection('vip_users').getFirstListItem(`email="${normalizedEmail}"`);

    // ============================================================
    // STEP 5: Record found - log details
    // ============================================================
    logger.info('\n📋 STEP 4: VIP user record found in PocketBase');
    logger.info('  ✅ Query successful');
    logger.info('  Record Details:');
    logger.info('    - User ID:', record.id);
    logger.info('    - Email:', record.email);
    logger.info('    - Status:', record.status);
    logger.info('    - Created:', record.created);
    logger.info('    - Updated:', record.updated);
    logger.info('    - All fields:', Object.keys(record).join(', '));

    // ============================================================
    // STEP 6: Check if status is 'active'
    // ============================================================
    logger.info('\n📋 STEP 5: Checking VIP subscription status');
    logger.info('  Status value:', record.status);
    logger.info('  Expected status: "active"');
    logger.info('  Status match:', record.status === 'active' ? '✅ YES' : '❌ NO');

    if (record.status !== 'active') {
      logger.warn('\n❌ VIP login failed: User status is not active');
      logger.warn('  Email:', normalizedEmail);
      logger.warn('  Current status:', record.status);
      logger.warn('  Returning error response');
      logLoginAttempt(normalizedEmail, false, `Status: ${record.status}`);
      return res.json({ success: false, error: 'Not a VIP member' });
    }

    logger.info('  ✅ Status is active - user is a valid VIP member');

    // ============================================================
    // STEP 7: Return success response
    // ============================================================
    logger.info('\n📋 STEP 6: Preparing success response');
    const successResponse = {
      success: true,
      token: 'vip-token',
      email: normalizedEmail,
      userId: record.id,
    };
    logger.info('  Response object:', successResponse);
    logger.info('  ✅ Sending success response to client');
    logger.info('\n✅ VIP LOGIN SUCCESSFUL');
    logger.info('='.repeat(70));
    logLoginAttempt(normalizedEmail, true, `User ID: ${record.id}`);

    res.json(successResponse);
  } catch (error) {
    // ============================================================
    // STEP 5 (ERROR): Handle query errors
    // ============================================================
    logger.info('\n📋 STEP 4: Error occurred during PocketBase query');
    logger.error('  ❌ Query failed');
    logger.error('  Error message:', error.message);
    logger.error('  Error code:', error.code);
    logger.error('  Error status:', error.status);
    logger.error('  Error stack:', error.stack);

    // ============================================================
    // STEP 6 (ERROR): Classify error type
    // ============================================================
    logger.info('\n📋 STEP 5: Classifying error type');
    let errorType = 'Unknown error';
    let userMessage = 'Not a VIP member';

    if (error.message.includes('Failed to find record')) {
      errorType = 'Record not found';
      userMessage = 'Not a VIP member';
      logger.warn('  Error Type: Record not found');
      logger.warn('  Interpretation: No VIP user found with email:', normalizedEmail);
      logger.warn('  This email is not registered as a VIP customer');
    } else if (error.message.includes('Invalid filter')) {
      errorType = 'Invalid filter';
      userMessage = 'Server error';
      logger.error('  Error Type: Invalid filter');
      logger.error('  Interpretation: Filter syntax error in query');
    } else {
      errorType = 'Unknown error';
      userMessage = 'Server error';
      logger.error('  Error Type: Unknown');
      logger.error('  Interpretation: Unexpected error occurred');
    }

    logger.info('  Error classification:', errorType);
    logger.info('  User-facing message:', userMessage);

    // ============================================================
    // STEP 7 (ERROR): Return error response
    // ============================================================
    logger.info('\n📋 STEP 6: Preparing error response');
    const errorResponse = {
      success: false,
      error: userMessage,
      errorType: errorType,
      email: normalizedEmail,
    };
    logger.info('  Response object:', errorResponse);
    logger.info('  ✅ Sending error response to client');
    logger.info('\n❌ VIP LOGIN FAILED');
    logger.info('='.repeat(70));
    logLoginAttempt(normalizedEmail, false, `Error: ${errorType}`);

    res.json(errorResponse);
  }
});

export default router;