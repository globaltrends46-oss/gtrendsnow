# Gemini API - Quick Reference Guide

**Status**: ✅ VERIFIED & OPERATIONAL

---

## API Key Configuration

### Environment Variables (apps/api/.env)

```env
GEMINI_API_KEY=AIzaSyCtrjHsIvqzAj-jVTVhP7owWzMhjKQPB1c
GEMINI_API_KEY_NEW=AIzaSyCtrjHsIvqzAj-jVTVhP7owWzMhjKQPB1c
GOOGLE_API_KEY=AIzaSyCtrjHsIvqzAj-jVTVhP7owWzMhjKQPB1c
```

**Status**: ✅ All three keys are SET and IDENTICAL

---

## Available Endpoints

### 1. POST /generate-resume

**Purpose**: Generate professional ATS-optimized resume

**Auth**: VIP Required (Bearer token)

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "experience": "5 years as Senior Developer",
  "skills": "JavaScript, React, Node.js",
  "education": "BS Computer Science"
}
```

**Response**:
```json
{
  "success": true,
  "resume": "[Generated resume content]",
  "email": "john@example.com",
  "name": "John Doe"
}
```

**Model**: gemini-pro

**API Key**: GEMINI_API_KEY

---

### 2. POST /generate-cover-letter

**Purpose**: Generate personalized cover letter

**Auth**: VIP Required (Bearer token)

**Request**:
```json
{
  "name": "John Doe",
  "jobTitle": "Senior React Developer",
  "company": "Tech Company Inc",
  "skills": "React, Node.js, TypeScript"
}
```

**Response**:
```json
{
  "success": true,
  "coverLetter": "[Generated cover letter]",
  "email": "john@example.com",
  "company": "Tech Company Inc",
  "jobTitle": "Senior React Developer"
}
```

**Model**: gemini-1.5-flash

**API Key**: GEMINI_API_KEY_NEW

---

### 3. POST /gemini-chat

**Purpose**: Chat with Gemini AI

**Auth**: VIP Required (Bearer token)

**Request**:
```json
{
  "message": "What are the top 5 skills for a software developer?",
  "history": []
}
```

**Response**:
```json
{
  "success": true,
  "response": "[AI response]",
  "email": "john@example.com"
}
```

**Model**: gemini-pro

**API Key**: GEMINI_API_KEY

---

## Verification Commands

### Verify API Key Configuration

```bash
node src/utils/verify-gemini-api.js
```

**Output**: Checks all three API keys and tests connectivity

---

### Test All Endpoints

```bash
node src/utils/test-all-gemini-endpoints.js
```

**Output**: Tests all three endpoints and reports results

---

## Error Handling

### Error Types

| Error Type | Cause | Solution |
|-----------|-------|----------|
| Invalid API Key | Key is invalid/expired | Update .env with new key |
| API Quota Exceeded | Daily quota exceeded | Wait or upgrade plan |
| Rate Limited | Too many requests | Wait a few minutes |
| Network Error | Cannot reach API | Check internet/firewall |
| Unauthorized | Missing VIP token | Include Bearer token |

---

## Logging

### What Gets Logged

- 📄 Request details (email, name, content type)
- 🔑 API key status (length, prefix, format)
- 📤 API call details (model, prompt length)
- ✅ Response details (content length, duration)
- ❌ Error details (message, type, classification)

### View Logs

```bash
npm run dev
```

All API calls are logged to console with timestamps and details.

---

## Common Issues & Solutions

### Issue: "GEMINI_API_KEY not configured"

**Solution**:
```bash
# Check if key is set
cat apps/api/.env | grep GEMINI

# Restart server
npm run dev
```

---

### Issue: "Invalid API Key" error

**Solution**:
1. Get new key: https://aistudio.google.com/app/apikey
2. Update all three variables in .env
3. Restart server: `npm run dev`

---

### Issue: "Unauthorized: VIP access required"

**Solution**:
```bash
# Include Authorization header
curl -H "Authorization: Bearer YOUR_VIP_TOKEN" ...
```

---

## File Locations

| File | Purpose |
|------|----------|
| apps/api/.env | API key configuration |
| apps/api/src/routes/generate-resume.js | Resume generation endpoint |
| apps/api/src/routes/generate-cover-letter.js | Cover letter endpoint |
| apps/api/src/routes/gemini-chat.js | Chat endpoint |
| apps/api/src/utils/verify-gemini-api.js | Verification script |
| apps/api/GEMINI_API_VERIFICATION.md | Detailed verification report |
| apps/api/GEMINI_API_SETUP_COMPLETE.md | Complete setup guide |

---

## Quick Test

```bash
# 1. Verify API key
node src/utils/verify-gemini-api.js

# 2. Test endpoints
node src/utils/test-all-gemini-endpoints.js

# 3. Check health
curl http://localhost:3001/hcgi/api/health
```

---

## Status

✅ **All endpoints operational**
✅ **All API keys configured**
✅ **Error logging enabled**
✅ **Verification scripts ready**
✅ **Production ready**

---

**Last Updated**: 2024-12-19