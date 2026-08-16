import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import logger from './logger.js';

/**
 * Universal AI client supporting OmniRoute (OpenAI-compatible) and Google Gemini with automatic failover.
 */
export async function generateTextWithAI(prompt, loggerInstance = null) {
  const activeLogger = loggerInstance || logger;

  const omniKey = (process.env.OMNIROUTE_API_KEY || process.env.OMNIROUTE_KEY || process.env.OMNI_API_KEY || process.env.OPENROUTER_API_KEY)?.trim();
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_NEW)?.trim();

  // Potential OpenAI-compatible base URLs to attempt if OmniRoute key is provided
  const candidateBaseUrls = [];
  if (process.env.OMNIROUTE_BASE_URL) {
    candidateBaseUrls.push(process.env.OMNIROUTE_BASE_URL.replace(/\/$/, ''));
  }
  candidateBaseUrls.push('https://openrouter.ai/api/v1');
  candidateBaseUrls.push('https://api.openai.com/v1');

  const omniModel = process.env.OMNIROUTE_MODEL || 'google/gemini-2.5-flash' || 'openai/gpt-4o-mini';

  // 1. Try OmniRoute / OpenRouter / OpenAI gateways if key is present
  if (omniKey) {
    for (const baseUrl of candidateBaseUrls) {
      try {
        activeLogger.info(`🤖 Attempting AI generation via OmniRoute gateway [${baseUrl}]...`);
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${omniKey}`,
            'HTTP-Referer': 'https://gtrendsnow.com',
            'X-Title': 'GTrends Global'
          },
          body: JSON.stringify({
            model: omniModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            activeLogger.info(`✅ OmniRoute AI generation successful via [${baseUrl}]!`);
            return content;
          }
        } else {
          const errText = await response.text();
          activeLogger.warn(`⚠️ OmniRoute API error at [${baseUrl}] (${response.status}): ${errText.substring(0, 150)}`);
        }
      } catch (err) {
        activeLogger.warn(`⚠️ OmniRoute API request failed at [${baseUrl}]: ${err.message}`);
      }
    }
  }

  // 2. Fall back to Google Gemini API
  if (geminiKey) {
    try {
      activeLogger.info('🤖 Attempting AI generation via Google Gemini API...');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        activeLogger.info('✅ Gemini AI generation successful!');
        return text;
      }
    } catch (err) {
      activeLogger.error(`❌ Gemini API request failed: ${err.message}`);
    }
  }

  // 3. Fallback: If omniKey was formatted as a raw Gemini key (starts with AIzaSy)
  if (omniKey && omniKey.startsWith('AIzaSy')) {
    try {
      activeLogger.info('🤖 Attempting fallback generation treating OMNIROUTE_KEY as Gemini API Key...');
      const genAI = new GoogleGenerativeAI(omniKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        activeLogger.info('✅ Gemini fallback AI generation successful!');
        return text;
      }
    } catch (err) {
      activeLogger.error(`❌ Gemini fallback request failed: ${err.message}`);
    }
  }

  throw new Error('All AI providers (OmniRoute & Gemini) failed or API keys are missing/expired.');
}
