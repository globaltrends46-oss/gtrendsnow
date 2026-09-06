import 'dotenv/config';
import express from 'express';
import logger from '../utils/logger.js';
import { generateTextWithAI } from '../utils/aiClient.js';

const router = express.Router();

/**
 * POST /generate-cv - Generate or update professional CV/resume with ATS audit
 * Supports both 'new' and 'modify' modes.
 */
router.post('/', async (req, res) => {
  const {
    mode = 'new', // 'new' or 'modify'
    name,
    targetJobTitle,
    targetJobDescription,
    experience,
    skills,
    education,
    achievements,
    certifications,
    currentCvText,
    modificationDirections
  } = req.body;

  const candidateName = (name || 'Professional Candidate').trim();
  const isModification = mode === 'modify' || (currentCvText && currentCvText.length > 50);

  logger.info('📄 Advanced CV request received', {
    mode: isModification ? 'modify' : 'new',
    name: candidateName,
    targetJobTitle: targetJobTitle || 'Not specified',
    hasExistingCV: !!currentCvText,
    directionsLength: modificationDirections ? modificationDirections.length : 0,
    timestamp: new Date().toISOString(),
  });

  // Validation: Ensure either existing CV text or experience is provided
  if (!isModification && !experience && !skills) {
    return res.status(400).json({
      success: false,
      error: 'Please provide either your work experience/skills or upload an existing CV.'
    });
  }

  if (isModification && !currentCvText) {
    return res.status(400).json({
      success: false,
      error: 'Please provide or upload your existing CV text to update it.'
    });
  }

  // Construct comprehensive ATS-optimized prompt
  let prompt;
  if (isModification) {
    prompt = `You are an elite, world-class executive career coach and certified ATS (Applicant Tracking System) optimization specialist.
The user has uploaded their existing CV and provided explicit modification directions. Your job is to rewrite, modernize, and enhance their CV into a flawless, publication-grade, ATS-friendly document.

=== EXISTING CV CONTENT ===
${currentCvText}

=== USER'S MODIFICATION DIRECTIONS ===
${modificationDirections ? modificationDirections : 'Enhance professional impact, maximize ATS score, and strengthen action verbs and quantifiable metrics.'}

=== TARGET JOB (IF SPECIFIED) ===
Target Title: ${targetJobTitle || 'Inferred from CV'}
Target Job Description: ${targetJobDescription || 'Standard industry best practices'}

CRITICAL ATS REQUIREMENTS & RULES:
1. Incorporate every modification direction requested by the user.
2. Structure with standard, single-column ATS headings:
   - ## PROFESSIONAL SUMMARY
   - ## CORE COMPETENCIES & TECHNICAL SKILLS
   - ## PROFESSIONAL EXPERIENCE
   - ## EDUCATION & ACADEMIC CREDENTIALS
   - ## CERTIFICATIONS & AWARDS (if applicable)
3. Enhance all experience bullet points to follow the formula: [Strong Action Verb] + [Context/Task] + [Measurable Business Impact / Metric (% or $)].
4. Eliminate ATS-unfriendly formatting: no complex tables, no multi-column grids, no icon graphics. Use clean, beautiful Markdown.
5. Provide a realistic ATS score (88-98) and identify any critical missing industry keywords.

Return the result in JSON format ONLY, structured exactly like:
{
  "optimizedCV": "# FULL NAME\\n**Target Title** | Location | Email | Phone | LinkedIn\\n\\n---... (full markdown CV text)",
  "atsScore": 95,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": [
    "Actionable improvement tip 1",
    "Actionable improvement tip 2",
    "Actionable improvement tip 3"
  ]
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
  } else {
    // Mode: Build a Brand New CV
    prompt = `You are an elite, world-class executive career coach and certified ATS (Applicant Tracking System) optimization specialist.
Build a brand new, highly competitive, ATS-compliant CV from scratch based on the user's provided details:

=== USER PROFILE DETAILS ===
Candidate Name: ${candidateName}
Target Job Title: ${targetJobTitle || 'Experienced Specialist'}
Target Job Description: ${targetJobDescription || 'Standard professional industry standards'}
Experience History: ${experience || 'Extensive professional track record in target domain'}
Core Skills: ${skills || 'Strategic Planning, Execution, Cross-functional Leadership'}
Education: ${education || 'Bachelor Degree in Relevant Discipline'}
Key Achievements: ${achievements || 'Recognized for top performance and reliable delivery'}
Certifications: ${certifications || 'Industry Certified'}

CRITICAL ATS REQUIREMENTS & RULES:
1. Structure with standard, single-column ATS headings:
   - ## PROFESSIONAL SUMMARY
   - ## CORE COMPETENCIES & TECHNICAL SKILLS
   - ## PROFESSIONAL EXPERIENCE
   - ## EDUCATION & ACADEMIC CREDENTIALS
   - ## CERTIFICATIONS & RECOGNITIONS (if applicable)
2. Every experience bullet point must begin with an active past-tense verb (Engineered, Spearheaded, Accelerated, Delivered) and include quantifiable outcomes (e.g., "+35% efficiency", "$1.2M pipeline").
3. Seamlessly weave in relevant keywords matching "${targetJobTitle || 'Specialist'}" and the target job description.
4. Clean, beautiful Markdown without ATS-breaking column tables.

Return the result in JSON format ONLY, structured exactly like:
{
  "optimizedCV": "# ${candidateName.toUpperCase()}\\n**${targetJobTitle || 'Specialist'}** | Contact Details\\n\\n---... (full markdown CV text)",
  "atsScore": 94,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": [
    "Actionable improvement tip 1",
    "Actionable improvement tip 2",
    "Actionable improvement tip 3"
  ]
}
Do not wrap your response in markdown code blocks like \`\`\`json. Return pure JSON.`;
  }

  try {
    logger.info(`Sending prompt to OmniRoute AI engine for CV (${isModification ? 'modify' : 'new'})...`);
    const responseText = await generateTextWithAI(prompt, logger, {
      keyword: targetJobTitle || 'Professional Resume',
      category: 'tech'
    });

    let parsedResult;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON block from AI output');
      }
    } catch (parseErr) {
      logger.warn('Failed to parse CV JSON from AI response, using fallback extraction.');
      // Extract title/content from markdown
      parsedResult = {
        optimizedCV: responseText.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim(),
        atsScore: 90,
        missingKeywords: ['Targeted Domain Acronyms', 'Quantifiable ROI Metrics'],
        suggestions: [
          'Review the bullet points to ensure all metrics reflect your exact achievements',
          'Export in clean single-column format for guaranteed 99%+ ATS scanning accuracy'
        ]
      };
    }

    res.json({
      success: true,
      mode: isModification ? 'modify' : 'new',
      generatedCV: parsedResult.optimizedCV || responseText,
      atsScore: parsedResult.atsScore || 92,
      missingKeywords: parsedResult.missingKeywords || [],
      suggestions: parsedResult.suggestions || [],
      name: candidateName
    });
  } catch (apiError) {
    logger.error('❌ AI CV generation failed:', apiError.message);
    res.status(500).json({ success: false, error: apiError.message });
  }
});

export default router;