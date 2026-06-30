import express from 'express';

const router = express.Router();

// GET /test - Simple health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;