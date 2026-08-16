import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import { generateTextWithAI } from '../utils/aiClient.js';

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

  try {
    logger.info('Sending prompt to Universal AI engine for CV and ATS Audit...');
    const responseText = await generateTextWithAI(prompt, logger);
    
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
    logger.error('❌ AI CV generation failed:', apiError.message);
    res.status(500).json({ success: false, error: apiError.message });
  }
});

export default router;