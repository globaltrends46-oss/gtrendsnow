import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { vipAuthMiddleware } from '../middleware/vip-auth.js';

const router = express.Router();

router.use(vipAuthMiddleware);

router.post('/', async (req, res) => {
  const { name, email, experience, skills, education } = req.body;
  const userEmail = req.user.email;

  logger.info('📄 Resume generation request received', { userEmail, name });

  console.log('\n' + '='.repeat(70));
  console.log('🚀 POST /generate-resume endpoint called');
  console.log('='.repeat(70));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', { name, email, experience, skills, education });
  console.log('👤 User Email:', userEmail);

  // Validate required fields
  console.log('\n📋 STEP 1: Validating required fields');
  if (!name || !experience || !skills) {
    console.log('  ❌ Validation failed: Missing required fields');
    logger.warn('❌ Resume validation failed: Missing required fields', {
      name: !!name,
      experience: !!experience,
      skills: !!skills,
    });
    return res.status(400).json({
      error: 'name, experience, and skills are required',
    });
  }
  console.log('  ✅ All required fields present');

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
    logger.info('✅ Gemini AI client initialized successfully');
  } catch (initError) {
    console.log('  ❌ Failed to initialize Gemini AI client');
    console.log('  Error:', initError.message);
    logger.error('❌ Failed to initialize Gemini AI client', { error: initError.message });
    throw initError;
  }

  const prompt = `Generate a professional, ATS-optimized resume for the following:

Name: ${name}
Email: ${email || userEmail}
Experience: ${experience}
Skills: ${skills}
Education: ${education || 'Not provided'}

Requirements:
1. Use strong action verbs and quantified achievements
2. Include professional summary, work experience, skills, and education sections
3. Optimize for ATS (Applicant Tracking Systems)
4. Use professional formatting with clear section headings
5. Highlight relevant achievements and metrics
6. Keep it concise but impactful (500-800 words)

Provide the resume in a professional format ready to use.`;

  console.log('\n📋 STEP 4: Calling Gemini API');
  console.log('  📤 Sending generateContent request...');
  logger.info('📤 Sending prompt to Gemini API', { model: 'gemini-2.5-flash' });

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const resume = result.response.text();

    console.log('  ✅ Response received from Gemini API');
    console.log('  ⏱️  Duration:', duration, 'seconds');
    logger.info('✅ Resume generated successfully', {
      userEmail,
      name,
      resumeLength: resume.length,
      duration: `${duration}s`,
    });

    console.log('\n✅ SUCCESS: Resume generated and response sent');
    console.log('='.repeat(70));
    console.log();

    res.json({
      success: true,
      resume,
      email: userEmail,
      name,
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