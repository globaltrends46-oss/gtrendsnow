import rateLimit from 'express-rate-limit';

/**
 * Dedicated Rate Limiter for AI Generation Endpoints
 * Limits users to 15 AI generation calls per 10-minute window.
 */
export const aiRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Rate limit reached: Please wait a few minutes before generating additional AI documents.'
  },
  validate: { trustProxy: false }
});

/**
 * Strict Rate Limiter for SMS/OTP Endpoints
 * Prevents SMS bombing and credit draining (3 OTPs per 10 minutes).
 */
export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests. Please wait 10 minutes before requesting a new code.'
  },
  validate: { trustProxy: false }
});

/**
 * Rate Limiter for Authentication / VIP Login
 * Prevents brute-force email enumeration and credential stuffing (5 attempts per minute).
 */
export const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait 60 seconds before trying again.'
  },
  validate: { trustProxy: false }
});
