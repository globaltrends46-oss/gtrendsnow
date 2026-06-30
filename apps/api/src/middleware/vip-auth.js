import 'dotenv/config';
import jwt from 'jsonwebtoken';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Check if date is in the past (expired)
 */
function isDateExpired(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  // Set time to midnight for date-only comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

/**
 * VIP Authentication Middleware
 * Verifies JWT token and checks VIP subscription status in PocketBase
 * Enforces 30-day subscription expiration
 * Attaches user email to req.user.email
 */
export async function vipAuthMiddleware(req, res, next) {
  logger.info('🔐 VIP Auth Middleware: Checking authorization header');

  // Extract Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('❌ VIP Auth: Missing or invalid Authorization header');
    throw new Error('Unauthorized: Missing or invalid Authorization header');
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.slice(7);
  logger.info('🔑 VIP Auth: Token extracted from header');

  // Verify JWT token
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('❌ VIP Auth: JWT_SECRET not configured in environment');
    throw new Error('Server configuration error: JWT_SECRET not set');
  }

  let decoded;
  try {
    logger.info('🔍 VIP Auth: Verifying JWT token');
    decoded = jwt.verify(token, jwtSecret);
    logger.info('✅ VIP Auth: JWT token verified', { email: decoded.email });
  } catch (error) {
    logger.warn('❌ VIP Auth: JWT verification failed', { error: error.message });
    throw new Error('Unauthorized: Invalid or expired token');
  }

  const email = decoded.email;
  if (!email) {
    logger.warn('❌ VIP Auth: Token missing email claim');
    throw new Error('Unauthorized: Token missing email claim');
  }

  // Check VIP subscription status in PocketBase
  try {
    logger.info('📋 VIP Auth: Checking VIP status in PocketBase', { email });
    const record = await pb.collection('vip_customers').getFirstListItem(`email="${email}"`);

    logger.info('✅ VIP Auth: VIP customer found', { customerId: record.id, email });

    // Check if subscription is active
    if (record.status !== 'active') {
      logger.warn('❌ VIP Auth: Subscription not active', { email, status: record.status });
      throw new Error('Unauthorized: Subscription is not active');
    }

    // Check if subscription has not expired (30-day model)
    const expirationDateStr = record.expiration_date;
    const isExpired = isDateExpired(expirationDateStr);

    logger.info('📅 VIP Auth: Checking subscription expiration', {
      email,
      expirationDate: expirationDateStr,
      isExpired,
    });

    if (isExpired) {
      logger.warn('❌ VIP Auth: Subscription expired', { email, expirationDate: expirationDateStr });
      throw new Error('Unauthorized: VIP subscription has expired. Please renew at Gumroad.');
    }

    logger.info('✅ VIP Auth: Subscription is valid and active', {
      email,
      expirationDate: expirationDateStr,
    });

    // Attach user info to request
    req.user = {
      email,
      vipId: record.id,
      expirationDate: record.expiration_date,
    };

    logger.info('✅ VIP Auth: User authenticated successfully', { email });
    next();
  } catch (error) {
    if (error.message.includes('Failed to find record')) {
      logger.warn('❌ VIP Auth: VIP customer not found', { email });
      throw new Error('Unauthorized: Not a VIP member');
    }
    logger.error('❌ VIP Auth: Error checking VIP status', { email, error: error.message });
    throw error;
  }
}

export default vipAuthMiddleware;