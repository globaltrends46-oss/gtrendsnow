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
  const omniBaseUrl = (process.env.OMNIROUTE_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
  const omniModel = process.env.OMNIROUTE_MODEL || 'google/gemini-2.5-flash' || 'openai/gpt-4o-mini';

  const geminiKey = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_NEW)?.trim();

  // Try OmniRoute / OpenRouter API first if key is present
  if (omniKey) {
    try {
      activeLogger.info(`🤖 Attempting AI generation via OmniRoute/Universal Gateway...`);
      const response = await fetch(`${omniBaseUrl}/chat/completions`, {
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
          activeLogger.info('✅ OmniRoute AI generation successful!');
          return content;
        }
      } else {
        const errText = await response.text();
        activeLogger.warn(`⚠️ OmniRoute API error (${response.status}): ${errText.substring(0, 150)}`);
      }
    } catch (err) {
      activeLogger.warn(`⚠️ OmniRoute API request failed: ${err.message}`);
    }
  }

  // Fall back to Google Gemini API
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

  throw new Error('All AI providers (OmniRoute & Gemini) failed or API keys are missing/expired.');
}
