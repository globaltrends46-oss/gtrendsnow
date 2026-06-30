import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /pinterest/pin - Create a pin on Pinterest board
router.post('/pin', async (req, res) => {
  const { blogUrl, title, blogTitle, description, imageUrl, category, boardId } = req.body;
  
  const finalTitle = title || blogTitle;

  // Validate required fields
  if (!finalTitle || !blogUrl || !imageUrl) {
    return res.status(400).json({ error: 'Title (or blogTitle), blogUrl, and imageUrl are required' });
  }

  const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('PINTEREST_ACCESS_TOKEN environment variable is not set');
  }

  const targetBoardId = boardId || process.env.VITE_PINTEREST_BOARD_ID || '1118226101377855660';
  const pinDescription = description || `${finalTitle}\n\n${blogUrl}`;

  const pinData = {
    title: finalTitle,
    description: pinDescription,
    link: blogUrl,
    image_url: imageUrl,
    board_id: targetBoardId,
  };

  logger.info('Creating Pinterest pin', { title: finalTitle, boardId: targetBoardId, blogUrl });

  const response = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pinData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`Pinterest API error: ${response.status}`, { errorText, pinData });
    throw new Error(`Pinterest API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  logger.info(`Pinterest pin created successfully`, { pinId: data.id, title: finalTitle });

  res.json({
    success: true,
    message: 'Pin created successfully on Pinterest',
    pinId: data.id,
    pinUrl: `https://pinterest.com/pin/${data.id}`,
    boardUrl: 'https://pinterest.com/gtrends_network/',
    pin: data,
  });
});

export default router;