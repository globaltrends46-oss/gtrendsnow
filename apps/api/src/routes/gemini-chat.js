import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { vipAuthMiddleware } from '../middleware/vip-auth.js';

const router = express.Router();

router.use(vipAuthMiddleware);

router.post('/', async (req, res) => {
  const { message, history } = req.body;
  const email = req.user.email;

  logger.info('💬 Gemini chat request received', { email, messageLength: message ? message.length : 0 });

  console.log('\n' + '='.repeat(70));
  console.log('🚀 POST /gemini-chat endpoint called');
  console.log('='.repeat(70));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', { messageLength: message ? message.length : 0, historyLength: history ? history.length : 0 });
  console.log('👤 User Email:', email);

  // Validate required fields
  console.log('\n📋 STEP 1: Validating required fields');
  if (!message) {
    console.log('  ❌ Validation failed: Missing message parameter');
    logger.warn('❌ Gemini chat validation failed: Missing message parameter', { email });
    return res.status(400).json({ error: 'message is required' });
  }
  console.log('  ✅ Message parameter present');
  console.log('  Message length:', message.length, 'characters');

  // Load and verify GEMINI_API_KEY
  console.log('\n📋 STEP 2: Loading GEMINI_API_KEY from environment');
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  console.log('  GEMINI_API_KEY status:', apiKey ? '✅ SET' : '❌ NOT SET');
  logger.info('🔑 GEMINI_API_KEY status:', apiKey ? 'SET' : 'NOT SET');

  if (apiKey) {
    console.log('  Key length:', apiKey.length, 'characters');
    console.log('  Key prefix:', apiKey.substring(0, 10) + '...');
    console.log('  Key suffix:', '...' + apiKey.substring(apiKey.length - 10));
    console.log('  Key format check:', apiKey.startsWith('AIza') ? '✅ Valid format' : '⚠️ Unexpected format');
    logger.info('🔑 Gemini API Key loaded:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 10));
  } else {
    console.log('  ❌ GEMINI_API_KEY is not set in environment');
    logger.error('❌ GEMINI_API_KEY not configured');
  }

  if (!apiKey) {
    console.log('\n❌ FATAL ERROR: GEMINI_API_KEY not configured');
    logger.error('❌ GEMINI_API_KEY not found in environment variables');
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }

  // Initialize Gemini AI
  console.log('\n📋 STEP 3: Initializing Google Generative AI client');
  let genAI;
  let model;
  
  try {
    genAI = new GoogleGenerativeAI({
      apiKey: apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    });
    console.log('  ✅ GoogleGenerativeAI instance created');

    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('  ✅ Model instance obtained');
    logger.info('%s client initialized successfully', 'Gemini AI');
  } catch (initError) {
    console.log('  ❌ Failed to initialize Gemini AI client');
    console.log('  Error:', initError.message);
    logger.error('❌ Failed to initialize Gemini AI client', { error: initError.message });
    throw initError;
  }

  console.log('\n📋 STEP 4: Starting chat session');
  const chat = model.startChat({
    history: history || [],
  });
  console.log('  ✅ Chat session started');

  console.log('\n📋 STEP 5: Calling Gemini API');
  console.log('  📤 Sending message to Gemini API...');
  logger.info('📤 Sending message to Gemini API', {
    email,
    messageLength: message.length,
    historyLength: history ? history.length : 0,
    model: 'gemini-2.5-flash',
  });

  const startTime = Date.now();

  try {
    const result = await chat.sendMessage(message);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const response = result.response.text();

    console.log('  ✅ Response received from Gemini API');
    console.log('  ⏱️  Duration:', duration, 'seconds');
    console.log('  Response length:', response.length, 'characters');
    logger.info('✅ Chat response received successfully', {
      email,
      messageLength: message.length,
      responseLength: response.length,
      duration: `${duration}s`,
      model: 'gemini-2.5-flash',
    });

    console.log('\n✅ SUCCESS: Chat response generated and sent');
    console.log('='.repeat(70));
    console.log();

    res.json({
      success: true,
      response,
      email,
    });
  } catch (apiError) {
    console.log('  ❌ Gemini API call failed');
    console.log('  Error message:', apiError.message);
    console.log('  Error type:', apiError.constructor.name);
    logger.error('❌ Gemini API Error:', apiError.message);
    throw apiError;
  }
});

export default router;