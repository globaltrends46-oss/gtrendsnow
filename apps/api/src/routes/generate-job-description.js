import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /generate-job-description - Generate professional job posting
router.post('/', async (req, res) => {
  const { jobTitle, jobDescription, skills } = req.body;

  logger.info('📋 Job description generation request received', {
    jobTitle,
    jobDescriptionLength: jobDescription ? jobDescription.length : 0,
    skillsCount: skills ? skills.length : 0,
  });

  console.log('\n' + '='.repeat(70));
  console.log('🚀 POST /generate-job-description endpoint called');
  console.log('='.repeat(70));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', { jobTitle, jobDescription, skills });

  // Validate required fields
  console.log('\n📋 STEP 1: Validating required fields');
  if (!jobTitle || !jobDescription || !skills) {
    console.log('  ❌ Validation failed: Missing required fields');
    logger.warn('❌ Job description validation failed: Missing required fields');
    return res.status(400).json({
      error: 'jobTitle, jobDescription, and skills are required',
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

  const prompt = `Generate a professional, comprehensive job posting based on the following information:

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}

Requirements:
1. Write a compelling job title (if needed, improve the provided one)
2. Create an engaging job summary (2-3 sentences)
3. List key responsibilities (5-7 bullet points)
4. Outline required qualifications (5-7 bullet points)
5. Highlight nice-to-have skills (3-5 bullet points)
6. Include benefits and compensation expectations (general)
7. Add company culture and work environment details
8. Use professional, engaging tone
9. Format with clear sections and bullet points
10. Make it ATS-friendly and SEO-optimized

Provide the complete job posting in a professional format ready to post on job boards.`;

  console.log('\n📋 STEP 4: Calling Gemini API');
  console.log('  📤 Sending generateContent request...');
  logger.info('📤 Sending prompt to Gemini API', { model: 'gemini-1.5-flash' });

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const generatedJobPosting = result.response.text();

    console.log('  ✅ Response received from Gemini API');
    console.log('  ⏱️  Duration:', duration, 'seconds');
    logger.info('✅ Job description generated successfully', {
      jobTitle,
      postingLength: generatedJobPosting.length,
      duration: `${duration}s`,
    });

    console.log('\n✅ SUCCESS: Job description generated and response sent');
    console.log('='.repeat(70));
    console.log();

    res.json({
      success: true,
      generatedJobPosting,
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