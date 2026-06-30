import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get PocketBase admin authentication token
 * Authenticates as admin and returns the auth token for API calls
 * Includes comprehensive logging and error handling with admin user existence checks
 */
async function getAdminAuthToken() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

  // Validate credentials are configured
  if (!adminEmail || !adminPassword) {
    const errorMsg = 'PocketBase admin credentials not configured in environment';
    logger.error('❌ Admin authentication failed: Missing credentials', {
      hasEmail: !!adminEmail,
      hasPassword: !!adminPassword,
    });
    throw new Error(errorMsg);
  }

  try {
    // Log authentication attempt with detailed information
    console.log(`Attempting to authenticate with email: ${adminEmail}`);
    logger.info('🔐 Starting admin authentication process', {
      email: adminEmail,
      passwordLength: adminPassword.length,
      pocketbaseUrl: pb.baseUrl,
    });

    console.log(`Password length: ${adminPassword.length} characters`);
    logger.info('📝 Authentication credentials prepared', {
      email: adminEmail,
      passwordLength: adminPassword.length,
    });

    console.log(`PocketBase URL: ${pb.baseUrl}`);
    logger.info('🌐 PocketBase connection details', {
      baseUrl: pb.baseUrl,
      isConnected: !!pb.baseUrl,
    });

    // Attempt authentication with PocketBase
    logger.info('📡 Calling pb.admins.authWithPassword()...', { email: adminEmail });
    const adminAuth = await pb.admins.authWithPassword(adminEmail, adminPassword);

    // Verify token was obtained
    const adminToken = pb.authStore.token;
    if (!adminToken) {
      const errorMsg = 'Failed to obtain admin authentication token after successful auth call';
      logger.error('❌ Admin auth failed: No token in authStore', {
        email: adminEmail,
        authStoreValid: pb.authStore.isValid,
        hasToken: !!adminToken,
      });
      throw new Error(errorMsg);
    }

    // Log successful authentication
    console.log('Admin authentication successful');
    logger.info('✅ Admin authentication successful', {
      email: adminEmail,
      token: adminToken.substring(0, 20) + '...',
      isValid: pb.authStore.isValid,
    });

    return adminToken;
  } catch (error) {
    // Detailed error logging and classification
    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'unknown';
    const errorStatus = error.status || error.statusCode || 'unknown';

    // Log initial error details
    console.log(`Authentication failed: ${errorMessage}`);
    logger.error('❌ Admin authentication failed', {
      email: adminEmail,
      errorMessage,
      errorCode,
      errorStatus,
      errorStack: error.stack,
    });

    console.log(`Error code: ${errorCode}`);
    logger.info('📋 Error code details', { code: errorCode });

    console.log(`Error status: ${errorStatus}`);
    logger.info('📋 Error status details', { status: errorStatus });

    // Attempt to check if admin user exists
    let adminUserExists = false;
    let adminUserCheckError = null;

    try {
      logger.info('🔍 Checking if admin user exists in PocketBase...', { email: adminEmail });
      const adminList = await pb.collection('admins').getList(1, 1, {
        filter: `email="${adminEmail}"`,
      });

      adminUserExists = adminList.items && adminList.items.length > 0;

      if (adminUserExists) {
        console.log('Admin user exists: true');
        logger.info('✅ Admin user exists in PocketBase', {
          email: adminEmail,
          adminCount: adminList.items.length,
          adminId: adminList.items[0]?.id,
        });
      } else {
        console.log('Admin user exists: false');
        logger.warn('⚠️ Admin user NOT found in PocketBase', {
          email: adminEmail,
          searchFilter: `email="${adminEmail}"`,
        });
      }
    } catch (checkError) {
      adminUserCheckError = checkError.message;
      console.log(`Admin user lookup failed: ${checkError.message}`);
      logger.error('❌ Failed to check if admin user exists', {
        email: adminEmail,
        checkError: checkError.message,
        checkErrorStack: checkError.stack,
      });
    }

    // Classify the error type
    let errorType = 'Unknown error';
    let userFriendlyMessage = 'Admin authentication failed';

    if (errorMessage.includes('Invalid credentials') || errorStatus === 401) {
      errorType = 'Invalid credentials';
      userFriendlyMessage = `Admin authentication failed: Invalid credentials for ${adminEmail}. Please verify the admin password is correct in the .env file.`;
    } else if (errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorStatus === 404) {
      errorType = 'User not found';
      userFriendlyMessage = `Admin authentication failed: Admin user '${adminEmail}' not found in PocketBase. Please verify the admin user exists and the email is correct.`;
    } else if (errorMessage.includes('Network') || errorMessage.includes('ECONNREFUSED')) {
      errorType = 'Connection error';
      userFriendlyMessage = `Admin authentication failed: Cannot connect to PocketBase. Please verify PocketBase is running and accessible.`;
    } else {
      userFriendlyMessage = `Admin authentication failed: ${errorMessage}`;
    }

    // Build comprehensive error message
    const detailedErrorMessage = `Admin authentication failed. Email: ${adminEmail}, Error: ${errorMessage}. Admin user exists: ${adminUserExists}. ${adminUserCheckError ? `Admin user lookup error: ${adminUserCheckError}. ` : ''}Please verify admin credentials in PocketBase.`;

    logger.error('📋 Comprehensive error summary', {
      email: adminEmail,
      errorType,
      errorMessage,
      errorCode,
      errorStatus,
      adminUserExists,
      adminUserCheckError,
      detailedErrorMessage,
    });

    // Throw error with detailed message
    const finalError = new Error(detailedErrorMessage);
    finalError.originalError = error;
    finalError.errorType = errorType;
    finalError.adminUserExists = adminUserExists;
    finalError.statusCode = 401;
    throw finalError;
  }
}

/**
 * Helper function to call integrated AI stream endpoint with authentication
 * Collects full SSE stream response
 */
async function callAIStream(prompt, adminToken) {
  const userMessage = JSON.stringify([{ type: 'text', text: prompt }]);
  const aiStreamUrl = 'http://localhost:3001/hcgi/api/integrated-ai/stream';

  logger.info('🤖 Calling AI stream endpoint', {
    url: aiStreamUrl,
    promptLength: prompt.length,
    hasAuthToken: !!adminToken,
  });

  try {
    const response = await fetch(aiStreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    logger.info('📊 AI stream response received', {
      status: response.status,
      statusText: response.statusText,
      url: aiStreamUrl,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('❌ AI stream request failed', {
        status: response.status,
        statusText: response.statusText,
        url: aiStreamUrl,
        errorBody: errorText,
      });
      throw new Error(`AI stream request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    let fullContent = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === 'content') {
                fullContent += event.data.content;
              }
            } catch (e) {
              logger.warn('⚠️ Failed to parse SSE event', { line, error: e.message });
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    logger.info('✅ AI stream content collected', { contentLength: fullContent.length });
    return fullContent;
  } catch (error) {
    logger.error('❌ Exception during AI stream call', {
      url: aiStreamUrl,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Extract title from markdown or plain text
 */
function extractTitle(content) {
  // Try to find markdown heading
  const markdownMatch = content.match(/^#+\s+(.+)$/m);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }

  // Try to find first line that looks like a title
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 10 && trimmed.length < 200) {
      return trimmed;
    }
  }

  return 'The Future of Remote Work in the US, UK, and EU Markets - 2024 Trends and Opportunities';
}

/**
 * Extract image URL from AI response
 */
function extractImageUrl(content) {
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    return urlMatch[0];
  }
  return null;
}

/**
 * POST /generate-blog - Generate and publish AI blog post immediately
 */
router.post('/', async (req, res) => {
  logger.info('🚀 Starting immediate AI blog post generation and publishing');

  try {
    // Step 0: Get admin authentication token
    logger.info('🔐 Obtaining PocketBase admin authentication...');
    const adminToken = await getAdminAuthToken();
    logger.info('✅ Admin token obtained successfully');

    // Step 1: Generate comprehensive blog post via AI
    const blogPrompt = `Generate a comprehensive, SEO-optimized blog post on the topic: "The Future of Remote Work in the US, UK, and EU Markets - 2024 Trends and Opportunities"

Requirements:
1. Professional, SEO-optimized title (include keywords: remote work, 2024, trends, opportunities)
2. Detailed 1500+ word article body covering:
   - Executive summary of remote work trends in 2024
   - US Market: Remote work adoption rates, opportunities, challenges, salary trends, industry insights
   - UK Market: Remote work regulations, opportunities, cost of living impact, regional differences
   - EU Market: GDPR implications, cross-border remote work, opportunities, challenges
   - Global trends affecting all regions
   - Future predictions and opportunities for 2024-2026
   - Actionable insights for professionals and employers
3. Use professional, data-driven tone with statistics and real-world examples
4. Include clear section headings and subheadings
5. Format with proper markdown structure

After generating the article, use the generate_image tool to create a professional featured image for this blog post. The image should depict: modern remote work environment, global connectivity, diverse professionals working from different locations, professional and contemporary style, suitable for a career trends blog.

Provide the complete article text and the generated image URL.`;

    logger.info('📝 Calling AI stream endpoint to generate blog post...');
    const blogContent = await callAIStream(blogPrompt, adminToken);
    logger.info('✅ Blog content generated from AI');

    // Step 2: Extract title from AI response
    const title = extractTitle(blogContent);
    logger.info(`📌 Extracted title: ${title}`);

    // Step 3: Generate featured image via AI
    logger.info('🖼️ Generating featured image via AI...');
    const imagePrompt = `Create a professional featured image for a blog post about "The Future of Remote Work in the US, UK, and EU Markets - 2024 Trends and Opportunities".

Image specifications:
- Style: Modern, professional, contemporary
- Content: Remote work environment, global connectivity, diverse professionals, multiple locations
- Elements: Laptops, video calls, world map, diverse team members, modern office/home setup
- Color scheme: Professional blues, greens, and neutrals
- Aspect ratio: 16:9 (suitable for blog featured image)
- Quality: High-resolution, suitable for web and social media

Generate the image and provide the URL.`;

    const imageContent = await callAIStream(imagePrompt, adminToken);
    logger.info('✅ Featured image generated from AI');

    // Step 4: Extract image URL from AI response
    const featuredImageUrl = extractImageUrl(imageContent);
    logger.info(`🖼️ Extracted image URL: ${featuredImageUrl || 'No URL found'}`);

    // Step 5: Create record in PocketBase ai_blog_posts collection
    logger.info('💾 Creating blog post record in PocketBase...');
    const record = await pb.collection('ai_blog_posts').create({
      title,
      content: blogContent,
      featured_image_url: featuredImageUrl || null,
      author: 'GTrends AI Research',
      region: 'US',
      published_date: new Date('2026-05-09').toISOString(),
      status: 'published',
    });

    logger.info(`✅ Blog post published successfully!`, {
      postId: record.id,
      title,
      region: 'US',
      publishedDate: '2026-05-09',
    });

    res.json({
      success: true,
      message: 'AI blog post generated and published successfully',
      postId: record.id,
      title,
      region: 'US',
      publishedDate: '2026-05-09',
      featuredImageUrl: featuredImageUrl || null,
      contentLength: blogContent.length,
    });
  } catch (error) {
    logger.error('❌ Blog post generation failed:', error.message);
    // Return detailed error message to frontend with 401 status for auth errors
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: error.errorType || 'Unknown error',
      adminUserExists: error.adminUserExists !== undefined ? error.adminUserExists : null,
      details: 'Check server logs for more information',
    });
  }
});

export default router;