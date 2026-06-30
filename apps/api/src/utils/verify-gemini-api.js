import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from './logger.js';

/**
 * Comprehensive Gemini API verification script
 * Checks API key validity, connectivity, and basic functionality
 * Usage: node src/utils/verify-gemini-api.js
 */

async function verifyGeminiAPI() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 GEMINI API VERIFICATION SCRIPT');
  console.log('='.repeat(80));
  console.log('\n⏰ Timestamp:', new Date().toISOString());
  console.log('\n');

  // Step 1: Check environment variables
  console.log('📋 STEP 1: Checking Environment Variables');
  console.log('-'.repeat(80));

  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiKeyNew = process.env.GEMINI_API_KEY_NEW;
  const googleApiKey = process.env.GOOGLE_API_KEY;

  console.log('\n✓ GEMINI_API_KEY:');
  if (geminiKey) {
    console.log(`  Status: ✅ SET`);
    console.log(`  Length: ${geminiKey.length} characters`);
    console.log(`  Prefix: ${geminiKey.substring(0, 10)}...`);
    console.log(`  Format: ${geminiKey.startsWith('AIza') ? '✅ Valid (AIza prefix)' : '⚠️ Unexpected format'}`);
  } else {
    console.log(`  Status: ❌ NOT SET`);
  }

  console.log('\n✓ GEMINI_API_KEY_NEW:');
  if (geminiKeyNew) {
    console.log(`  Status: ✅ SET`);
    console.log(`  Length: ${geminiKeyNew.length} characters`);
    console.log(`  Prefix: ${geminiKeyNew.substring(0, 10)}...`);
    console.log(`  Format: ${geminiKeyNew.startsWith('AIza') ? '✅ Valid (AIza prefix)' : '⚠️ Unexpected format'}`);
  } else {
    console.log(`  Status: ❌ NOT SET`);
  }

  console.log('\n✓ GOOGLE_API_KEY:');
  if (googleApiKey) {
    console.log(`  Status: ✅ SET`);
    console.log(`  Length: ${googleApiKey.length} characters`);
    console.log(`  Prefix: ${googleApiKey.substring(0, 10)}...`);
    console.log(`  Format: ${googleApiKey.startsWith('AIza') ? '✅ Valid (AIza prefix)' : '⚠️ Unexpected format'}`);
  } else {
    console.log(`  Status: ❌ NOT SET`);
  }

  // Step 2: Verify all keys are identical
  console.log('\n\n📋 STEP 2: Verifying API Key Consistency');
  console.log('-'.repeat(80));

  const allKeysSet = geminiKey && geminiKeyNew && googleApiKey;
  const allKeysIdentical = geminiKey === geminiKeyNew && geminiKeyNew === googleApiKey;

  if (!allKeysSet) {
    console.log('\n❌ ERROR: Not all API keys are set in .env');
    console.log('   Missing keys:');
    if (!geminiKey) console.log('   - GEMINI_API_KEY');
    if (!geminiKeyNew) console.log('   - GEMINI_API_KEY_NEW');
    if (!googleApiKey) console.log('   - GOOGLE_API_KEY');
    return {
      success: false,
      error: 'Missing API keys in .env',
      timestamp: new Date().toISOString(),
    };
  }

  if (!allKeysIdentical) {
    console.log('\n⚠️ WARNING: API keys are not identical');
    console.log('   GEMINI_API_KEY === GEMINI_API_KEY_NEW:', geminiKey === geminiKeyNew);
    console.log('   GEMINI_API_KEY_NEW === GOOGLE_API_KEY:', geminiKeyNew === googleApiKey);
    console.log('   GEMINI_API_KEY === GOOGLE_API_KEY:', geminiKey === googleApiKey);
    console.log('\n   Recommendation: All three keys should be identical');
    console.log('   Update .env to use the same key for all three variables');
  } else {
    console.log('\n✅ All API keys are identical and properly configured');
  }

  // Step 3: Test API connectivity with gemini-2.5-flash model
  console.log('\n\n📋 STEP 3: Testing Gemini API Connectivity (gemini-2.5-flash)');
  console.log('-'.repeat(80));

  try {
    console.log('\n🤖 Initializing GoogleGenerativeAI client...');
    const genAI = new GoogleGenerativeAI(geminiKey);
    console.log('✅ GoogleGenerativeAI client initialized');

    console.log('\n📦 Getting gemini-2.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✅ gemini-2.5-flash model obtained');

    console.log('\n📤 Sending test prompt to Gemini API...');
    const testPrompt = 'Say "Gemini API is working correctly" in exactly 5 words.';
    console.log(`   Prompt: "${testPrompt}"`);

    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    const response = result.response.text();

    console.log('\n✅ Response received from Gemini API');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Response: "${response}"`);
    console.log(`   Response length: ${response.length} characters`);

    return {
      success: true,
      message: 'Gemini API is working correctly',
      apiKey: {
        geminiApiKey: geminiKey ? 'SET' : 'NOT SET',
        geminiApiKeyNew: geminiKeyNew ? 'SET' : 'NOT SET',
        googleApiKey: googleApiKey ? 'SET' : 'NOT SET',
        allIdentical: allKeysIdentical,
      },
      test: {
        model: 'gemini-2.5-flash',
        prompt: testPrompt,
        response: response,
        duration: `${duration}s`,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.log('\n❌ ERROR: Gemini API test failed');
    console.log(`   Error message: ${error.message}`);
    console.log(`   Error type: ${error.constructor.name}`);
    console.log(`   Error code: ${error.code || 'N/A'}`);
    console.log(`   Error status: ${error.status || 'N/A'}`);

    let errorType = 'Unknown error';
    let suggestion = 'Check the error message above';

    if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('401')) {
      errorType = 'Invalid API Key';
      suggestion = 'Verify GEMINI_API_KEY in apps/api/.env is correct and valid';
    } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
      errorType = 'API Quota Exceeded or Rate Limited';
      suggestion = 'Wait a few minutes and try again, or check your API quota';
    } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      errorType = 'Network Error';
      suggestion = 'Check your internet connection and firewall settings';
    } else if (error.message.includes('model') || error.message.includes('not found')) {
      errorType = 'Model Not Found';
      suggestion = 'Verify the model name is correct (gemini-2.5-flash)';
    }

    console.log(`\n   Error type: ${errorType}`);
    console.log(`   Suggestion: ${suggestion}`);

    return {
      success: false,
      error: error.message,
      errorType: errorType,
      suggestion: suggestion,
      apiKey: {
        geminiApiKey: geminiKey ? 'SET' : 'NOT SET',
        geminiApiKeyNew: geminiKeyNew ? 'SET' : 'NOT SET',
        googleApiKey: googleApiKey ? 'SET' : 'NOT SET',
        allIdentical: allKeysIdentical,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

verifyGeminiAPI().then(result => {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 VERIFICATION RESULT');
  console.log('='.repeat(80));
  console.log('\n' + JSON.stringify(result, null, 2));
  console.log('\n' + '='.repeat(80));
  console.log('\n');

  if (result.success) {
    console.log('✅ SUCCESS: Gemini API is properly configured and working!');
    console.log('   All routes using GEMINI_API_KEY should function correctly.');
    console.log('\n');
    process.exit(0);
  } else {
    console.log('❌ FAILED: Gemini API verification failed');
    console.log(`   Error: ${result.error}`);
    console.log(`   Type: ${result.errorType}`);
    console.log(`   Suggestion: ${result.suggestion}`);
    console.log('\n');
    process.exit(1);
  }
}).catch(error => {
  console.log('\n❌ FATAL ERROR during verification:');
  console.log(error.message);
  console.log('\n');
  process.exit(1);
});