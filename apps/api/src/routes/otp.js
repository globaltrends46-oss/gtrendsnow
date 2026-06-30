import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Validate phone format: +91 followed by exactly 10 digits
const validatePhoneFormat = (phone) => {
  const phoneRegex = /^\+91\d{10}$/;
  return phoneRegex.test(phone);
};

// POST /send-otp - Send OTP via 2Factor API with phone validation
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  // Validate phone is provided
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Validate phone format: +91 followed by exactly 10 digits
  if (!validatePhoneFormat(phone)) {
    return res.status(400).json({ error: 'Invalid phone format. Expected format: +91XXXXXXXXXX' });
  }

  const apiKey = process.env.MESSAGE91_API_KEY;
  if (!apiKey) {
    logger.error('MESSAGE91_API_KEY environment variable is not set');
    throw new Error('MESSAGE91_API_KEY environment variable is not set');
  }

  try {
    // Call 2Factor API to send OTP
    const url = `https://2factor.in/API/V1/sendOTP?phone=${encodeURIComponent(phone)}&key=${encodeURIComponent(apiKey)}`;
    
    logger.info(`Sending OTP request to 2Factor API for phone: ${phone}`);
    
    const response = await fetch(url);

    if (!response.ok) {
      logger.error(`2Factor API HTTP error: ${response.status} ${response.statusText}`);
      return res.status(400).json({ success: false, error: 'Failed to send OTP' });
    }

    const data = await response.json();
    
    // Log actual 2Factor API response for debugging
    logger.info(`2Factor API response for ${phone}:`, JSON.stringify(data, null, 2));

    // Check if OTP was sent successfully
    if (data.Status === 'Success') {
      logger.info(`OTP sent successfully to ${phone}`, { sessionId: data.Details });
      return res.json({
        success: true,
        message: 'OTP sent successfully',
      });
    }

    // If API returned error status
    logger.warn(`2Factor API returned error status for ${phone}:`, JSON.stringify(data, null, 2));
    return res.status(400).json({ success: false, error: 'Failed to send OTP' });
  } catch (error) {
    logger.error(`Exception while sending OTP to ${phone}:`, error.message);
    throw error;
  }
});

// POST /otp/send - Send OTP via 2Factor API (legacy endpoint)
router.post('/send', async (req, res) => {
  const { phone } = req.body;

  // Validate required fields
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const apiKey = process.env.MESSAGE91_API_KEY;
  if (!apiKey) {
    throw new Error('MESSAGE91_API_KEY environment variable is not set');
  }

  // Call 2Factor API to send OTP
  const url = `https://2factor.in/API/V1/sendOTP?phone=${encodeURIComponent(phone)}&key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`2Factor API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Check if OTP was sent successfully
  if (data.Status === 'Success') {
    logger.info(`OTP sent successfully to ${phone}`, { sessionId: data.Details });
    return res.json({
      success: true,
      sessionId: data.Details,
    });
  }

  // If API returned error status
  logger.warn(`Failed to send OTP to ${phone}`, { apiResponse: data });
  throw new Error(`Failed to send OTP: ${data.Details || 'Unknown error'}`);
});

// POST /otp/verify - Verify OTP via 2Factor API
router.post('/verify', async (req, res) => {
  const { sessionId, otp } = req.body;

  // Validate required fields
  if (!sessionId || !otp) {
    return res.status(400).json({ error: 'Session ID and OTP code are required' });
  }

  const apiKey = process.env.MESSAGE91_API_KEY;
  if (!apiKey) {
    throw new Error('MESSAGE91_API_KEY environment variable is not set');
  }

  // Call 2Factor API to verify OTP
  const url = `https://2factor.in/API/V1/verifyOTP?key=${encodeURIComponent(apiKey)}&otp=${encodeURIComponent(otp)}&sessionId=${encodeURIComponent(sessionId)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`2Factor API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Check if OTP was verified successfully
  if (data.Status === 'Success') {
    logger.info(`OTP verified successfully for session ${sessionId}`);
    return res.json({
      success: true,
      verified: true,
    });
  }

  // If OTP is invalid or expired
  logger.warn(`OTP verification failed for session ${sessionId}`, { apiResponse: data });
  return res.json({
    success: false,
    verified: false,
    error: data.Details || 'Invalid or expired OTP',
  });
});

export default router;