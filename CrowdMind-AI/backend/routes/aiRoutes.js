import express from 'express';
import { analyzeIncident, generateAISummary, getSocialFeed } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeIncident);
router.post('/summary', protect, generateAISummary);
router.get('/social-feed', protect, getSocialFeed);

export default router;
