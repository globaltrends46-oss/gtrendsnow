import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /generate-cv - Generate professional CV/resume with ATS audit
router.post('/', async (req, res) => {
  const { name, experience, skills, education, targetJobTitle, targetJobDescription, currentCvText } = req.body;

  logger.info('📄 Advanced CV generation request received', {
    name,
    experienceLength: experience ? experience.length : 0,
    skillsLength: skills ? skills.length : 0,
    educationLength: education ? education.length : 0,
    targetJobTitle,
    timestamp: new Date().toISOString(),
  });

  console.log('\n' + '='.repeat(70));
  console.log('🚀 POST /generate-cv endpoint called');
  console.log('='.repeat(70));
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📨 Request Body:', { name, targetJobTitle, experienceExists: !!experience, currentCvTextExists: !!currentCvText });

  // Validate required fields (either currentCvText or experience is required)
  if (!name || (!experience && !currentCvText)) {
    logger.warn('❌ CV generation validation failed: Missing name or experience/cvText');
    return res.status(400).json({
      success: false,
      error: 'name, and either experience or uploaded CV text are required',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    logger.error('❌ GEMINI_API_KEY not found in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Gemini API key is not configured on the server',
    });
  }

  let genAI;
  let model;
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    logger.info('✅ Gemini AI client initialized successfully for CV generator');
  } catch (initError) {
    logger.error('❌ Failed to initialize Gemini AI client:', initError.message);
    return res.status(500).json({ success: false, error: initError.message });
  }

  // Construct optimized AI prompt
  const prompt = `You are a professional Executive Resume Writer and ATS optimization expert.
Optimize the following candidate's profile to align perfectly with the Target Job Title: "${targetJobTitle || 'Professional Role'}" and Target Job Description: "${targetJobDescription || 'Not provided'}".

Candidate Details:
Name: ${name}
Current CV/Experience: ${currentCvText || experience}
Skills: ${skills}
Education: ${education || 'Not provided'}

Requirements for the Optimized CV:
1. Include a Professional Summary, Work Experience (with bullet points and action verbs), Skills, and Education.
2. Structure the experience using strong action verbs and quantified achievements.
3. Optimize headings and sections to be fully ATS friendly.

Perform an ATS Audit and compare the candidate's profile with the Target Job Title/Description. Estimate their ATS score and find key missing keywords and styling/structural recommendations.

Return your response in JSON format ONLY. Structure it exactly as:
{
  "optimizedCV": "Complete formatted CV text using clean Markdown.",
  "atsScore": 85,
  "missingKeywords": ["List key skills/technologies missing from their CV but highly relevant for the target job"],
  "suggestions": ["List 3-4 specific, actionable recommendations to improve their approval chance"]
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;

  logger.info('Sending prompt to Gemini API for CV and ATS Audit...');
  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const responseText = result.response.text();
    logger.info('✅ Received response from Gemini API for CV', { duration: `${duration}s` });

    let parsedResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (parseErr) {
      logger.warn('Failed to parse CV JSON from AI response, mapping to raw format.');
      parsedResult = {
        optimizedCV: responseText,
        atsScore: 70,
        missingKeywords: ['Keywords auditing requires structured response'],
        suggestions: ['Review your details manually for job alignment']
      };
    }

    res.json({
      success: true,
      generatedCV: parsedResult.optimizedCV,
      atsScore: parsedResult.atsScore,
      missingKeywords: parsedResult.missingKeywords,
      suggestions: parsedResult.suggestions,
      name,
    });
  } catch (apiError) {
    logger.error('❌ Gemini API CV generation failed:', apiError.message);
    res.status(500).json({ success: false, error: apiError.message });
  }
});

export default router;