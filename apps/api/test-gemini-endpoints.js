import 'dotenv/config';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3001/hcgi/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}]`;
  
  if (data) {
    console.log(`${color}${prefix} ${message}${colors.reset}`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`${color}${prefix} ${message}${colors.reset}`);
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(colors.bright + colors.cyan, title);
  console.log('='.repeat(80));
}

function logSubSection(title) {
  console.log('\n' + '-'.repeat(80));
  log(colors.cyan, title);
  console.log('-'.repeat(80));
}

/**
 * TEST ENDPOINT 1: POST /generate-job-description
 */
async function testGenerateJobDescription() {
  logSection('TEST 1: POST /generate-job-description');
  
  const endpoint = `${baseUrl}/generate-job-description`;
  const requestBody = {
    jobTitle: 'Senior React Developer',
    jobDescription: 'Looking for experienced React developer to lead our frontend team. Must have 5+ years of experience with modern React patterns.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL']
  };

  log(colors.blue, '📍 Endpoint:', { endpoint });
  log(colors.blue, '📨 Request Method:', { method: 'POST' });
  log(colors.blue, '📦 Request Body:', requestBody);
  
  try {
    logSubSection('Sending Request...');
    log(colors.yellow, '⏳ Waiting for response (this may take 30-60 seconds)...');
    
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    logSubSection('Response Received');
    log(colors.blue, '📊 Response Status:', { 
      status: response.status, 
      statusText: response.statusText,
      duration: `${duration}s`
    });
    
    log(colors.blue, '📋 Response Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });
    
    const data = await response.json();
    
    logSubSection('Response Body');
    log(colors.blue, '📥 Full Response:', data);
    
    if (response.ok && data.success) {
      logSubSection('✅ TEST RESULT: SUCCESS');
      log(colors.green, '✅ Job description endpoint returned:', {
        success: data.success,
        jobTitle: data.jobTitle,
        generatedPostingLength: data.generatedJobPosting ? data.generatedJobPosting.length : 0,
        generatedPostingPreview: data.generatedJobPosting ? data.generatedJobPosting.substring(0, 200) + '...' : 'N/A',
      });
      
      return {
        success: true,
        endpoint: 'POST /generate-job-description',
        status: response.status,
        duration: `${duration}s`,
        jobTitle: data.jobTitle,
        generatedPostingLength: data.generatedJobPosting ? data.generatedJobPosting.length : 0,
        message: 'SUCCESS: Job description endpoint returned {success: true, generatedJobPosting: ...}',
      };
    } else {
      logSubSection('❌ TEST RESULT: FAILED');
      log(colors.red, '❌ Endpoint returned error:', {
        success: data.success,
        error: data.error,
        status: response.status,
      });
      
      return {
        success: false,
        endpoint: 'POST /generate-job-description',
        status: response.status,
        error: data.error || 'Unknown error',
        duration: `${duration}s`,
        message: `FAILED: Status ${response.status} - ${data.error || 'Unknown error'}`,
      };
    }
  } catch (error) {
    logSubSection('❌ TEST RESULT: EXCEPTION');
    log(colors.red, '❌ Exception occurred:', {
      errorMessage: error.message,
      errorType: error.constructor.name,
      errorStack: error.stack,
    });
    
    return {
      success: false,
      endpoint: 'POST /generate-job-description',
      error: error.message,
      errorType: error.constructor.name,
      message: `FAILED: ${error.message}`,
    };
  }
}

/**
 * TEST ENDPOINT 2: POST /generate-cv
 */
async function testGenerateCV() {
  logSection('TEST 2: POST /generate-cv');
  
  const endpoint = `${baseUrl}/generate-cv`;
  const requestBody = {
    name: 'Test User',
    experience: '5 years as Senior Developer at Tech Corp, 3 years as Full Stack Engineer at StartupXYZ',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    education: 'BS Computer Science from State University (2018)'
  };

  log(colors.blue, '📍 Endpoint:', { endpoint });
  log(colors.blue, '📨 Request Method:', { method: 'POST' });
  log(colors.blue, '📦 Request Body:', requestBody);
  
  try {
    logSubSection('Sending Request...');
    log(colors.yellow, '⏳ Waiting for response (this may take 30-60 seconds)...');
    
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    logSubSection('Response Received');
    log(colors.blue, '📊 Response Status:', { 
      status: response.status, 
      statusText: response.statusText,
      duration: `${duration}s`
    });
    
    log(colors.blue, '📋 Response Headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });
    
    const data = await response.json();
    
    logSubSection('Response Body');
    log(colors.blue, '📥 Full Response:', data);
    
    if (response.ok && data.success) {
      logSubSection('✅ TEST RESULT: SUCCESS');
      log(colors.green, '✅ CV endpoint returned:', {
        success: data.success,
        name: data.name,
        generatedCVLength: data.generatedCV ? data.generatedCV.length : 0,
        generatedCVPreview: data.generatedCV ? data.generatedCV.substring(0, 200) + '...' : 'N/A',
      });
      
      return {
        success: true,
        endpoint: 'POST /generate-cv',
        status: response.status,
        duration: `${duration}s`,
        name: data.name,
        generatedCVLength: data.generatedCV ? data.generatedCV.length : 0,
        message: 'SUCCESS: CV endpoint returned {success: true, generatedCV: ...}',
      };
    } else {
      logSubSection('❌ TEST RESULT: FAILED');
      log(colors.red, '❌ Endpoint returned error:', {
        success: data.success,
        error: data.error,
        status: response.status,
      });
      
      return {
        success: false,
        endpoint: 'POST /generate-cv',
        status: response.status,
        error: data.error || 'Unknown error',
        duration: `${duration}s`,
        message: `FAILED: Status ${response.status} - ${data.error || 'Unknown error'}`,
      };
    }
  } catch (error) {
    logSubSection('❌ TEST RESULT: EXCEPTION');
    log(colors.red, '❌ Exception occurred:', {
      errorMessage: error.message,
      errorType: error.constructor.name,
      errorStack: error.stack,
    });
    
    return {
      success: false,
      endpoint: 'POST /generate-cv',
      error: error.message,
      errorType: error.constructor.name,
      message: `FAILED: ${error.message}`,
    };
  }
}

/**
 * MAIN TEST RUNNER
 */
async function runAllTests() {
  logSection('🧪 GEMINI ENDPOINTS TEST SUITE');
  
  log(colors.cyan, '📍 Base URL:', { baseUrl });
  log(colors.cyan, '⏰ Test Started:', { timestamp: new Date().toISOString() });
  log(colors.cyan, '📝 Testing:', { endpoints: ['POST /generate-job-description', 'POST /generate-cv'] });
  
  const results = [];
  
  // Test 1: Job Description
  const test1Result = await testGenerateJobDescription();
  results.push(test1Result);
  
  // Wait 2 seconds between tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: CV
  const test2Result = await testGenerateCV();
  results.push(test2Result);
  
  // Summary
  logSection('📊 TEST SUMMARY');
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  log(colors.cyan, '📈 Results:', {
    totalTests: results.length,
    passed: successCount,
    failed: failureCount,
    successRate: `${((successCount / results.length) * 100).toFixed(0)}%`,
  });
  
  log(colors.cyan, '\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? colors.green + '✅' : colors.red + '❌';
    console.log(`${status}${colors.reset} Test ${index + 1}: ${result.endpoint}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${result.duration}`);
    console.log(`   Message: ${result.message}`);
    console.log();
  });
  
  logSection('🎯 FINAL RESULT');
  
  if (failureCount === 0) {
    log(colors.green, '✅ ALL TESTS PASSED!');
    log(colors.green, '✅ Both Gemini endpoints are working correctly');
    log(colors.green, '✅ Job description generation: OPERATIONAL');
    log(colors.green, '✅ CV generation: OPERATIONAL');
  } else {
    log(colors.red, '❌ SOME TESTS FAILED');
    log(colors.red, `❌ ${failureCount} out of ${results.length} tests failed`);
    log(colors.red, '❌ Check the error messages above for details');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log();
  
  return {
    totalTests: results.length,
    passed: successCount,
    failed: failureCount,
    successRate: `${((successCount / results.length) * 100).toFixed(0)}%`,
    results: results,
    timestamp: new Date().toISOString(),
  };
}

// Run all tests
runAllTests().then(summary => {
  console.log('\n📊 Test Summary JSON:');
  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.failed === 0 ? 0 : 1);
}).catch(error => {
  log(colors.red, '❌ Fatal error during test execution:', { error: error.message });
  process.exit(1);
});