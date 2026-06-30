import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { vipAuthMiddleware } from '../middleware/vip-auth.js';

const router = express.Router();

router.use(vipAuthMiddleware);

router.post('/', async (req, res) => {
  const { name, jobTitle, company, skills } = req.body;
  const userEmail = req.user.email;

  logger.info('📝 Cover letter generation request received', { userEmail, company, jobTitle });

  console.log('\n' + '='.repeat(70));
  console.log('🚀 POST /generate-cover-letter endpoint called');
  console.log('='.repeat(70));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', { name, jobTitle, company, skills });
  console.log('👤 User Email:', userEmail);

  // Validate required fields
  console.log('\n📋 STEP 1: Validating required fields');
  if (!name || !jobTitle || !company || !skills) {
    console.log('  ❌ Validation failed: Missing required fields');
    logger.warn('❌ Cover letter validation failed: Missing required fields', {
      name: !!name,
      jobTitle: !!jobTitle,
      company: !!company,
      skills: !!skills,
    });
    return res.status(400).json({
      error: 'name, jobTitle, company, and skills are required',
    });
  }
  console.log('  ✅ All required fields present');

  // Load and verify GEMINI_API_KEY_NEW
  console.log('\n📋 STEP 2: Loading GEMINI_API_KEY_NEW from environment');
  const apiKey = process.env.GEMINI_API_KEY_NEW?.trim();
  
  console.log('  GEMINI_API_KEY_NEW status:', apiKey ? '✅ SET' : '❌ NOT SET');
  logger.info('🔑 GEMINI_API_KEY_NEW status:', apiKey ? 'SET' : 'NOT SET');

  if (apiKey) {
    console.log('  Key length:', apiKey.length, 'characters');
    console.log('  Key prefix:', apiKey.substring(0, 10) + '...');
    console.log('  Key suffix:', '...' + apiKey.substring(apiKey.length - 10));
    console.log('  Key format check:', apiKey.startsWith('AIza') ? '✅ Valid format' : '⚠️ Unexpected format');
    logger.info('🔑 Gemini API Key loaded:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 10));
  } else {
    console.log('  ❌ GEMINI_API_KEY_NEW is not set in environment');
    logger.error('❌ GEMINI_API_KEY_NEW not configured');
  }

  if (!apiKey) {
    console.log('\n❌ FATAL ERROR: GEMINI_API_KEY_NEW not configured');
    logger.error('❌ GEMINI_API_KEY_NEW not found in environment variables');
    throw new Error('GEMINI_API_KEY_NEW not found in environment variables');
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

  const prompt = `Generate a compelling, personalized professional cover letter (300-500 words) for the following:

Name: ${name}
Email: ${userEmail}
Job Title: ${jobTitle}
Company: ${company}
Skills: ${skills}

Requirements:
1. Write a compelling opening that shows enthusiasm for the role
2. Highlight relevant skills and achievements that match the job description
3. Demonstrate knowledge of the company and why you want to work there
4. Include specific examples of how your experience aligns with the role
5. Use professional tone and proper business letter format
6. Include a strong closing that encourages action
7. Keep it concise but impactful (300-500 words)

Provide the cover letter in a professional format ready to use.`;

  console.log('\n📋 STEP 4: Calling Gemini API');
  console.log('  📤 Sending generateContent request...');
  logger.info('📤 Sending prompt to Gemini API', { model: 'gemini-1.5-flash' });

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const coverLetter = result.response.text();

    console.log('  ✅ Response received from Gemini API');
    console.log('  ⏱️  Duration:', duration, 'seconds');
    logger.info('✅ Cover letter generated successfully', {
      userEmail,
      company,
      jobTitle,
      coverLetterLength: coverLetter.length,
      duration: `${duration}s`,
    });

    console.log('\n✅ SUCCESS: Cover letter generated and response sent');
    console.log('='.repeat(70));
    console.log();

    res.json({
      success: true,
      coverLetter,
      email: userEmail,
      company,
      jobTitle,
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