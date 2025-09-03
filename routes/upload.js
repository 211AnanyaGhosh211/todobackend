const express = require('express');
const multer = require('multer');
const { pool } = require('../db');
const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Upload video endpoint
router.post('/', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;

    // Insert video into database
    const query = 'INSERT INTO videos (video_data) VALUES (?)';
    const [result] = await pool.execute(query, [videoBuffer]);

    res.json({
      message: 'Video uploaded successfully',
      videoId: result.insertId,
      originalName: originalName,
      mimeType: mimeType,
      size: videoBuffer.length
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload video',
      details: error.message 
    });
  }
});

// Get all videos endpoint
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT id, LENGTH(video_data) as size FROM videos ORDER BY id DESC';
    const [rows] = await pool.execute(query);
    
    res.json({
      videos: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      details: error.message 
    });
  }
});

// Get specific video endpoint
router.get('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    const query = 'SELECT video_data FROM videos WHERE id = ?';
    const [rows] = await pool.execute(query, [videoId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = rows[0].video_data;
    
    res.set({
      'Content-Type': 'video/webm',
      'Content-Length': videoData.length,
      'Content-Disposition': `inline; filename="video_${videoId}.webm"`
    });
    
    res.send(videoData);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video',
      details: error.message 
    });
  }
});

module.exports = router;
