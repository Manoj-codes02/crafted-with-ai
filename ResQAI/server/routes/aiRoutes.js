const express = require('express');
const router = express.Router();
const { analyzeSymptoms, uploadWoundAnalysis, getDisasterAdvisory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/analyze', protect, analyzeSymptoms);
router.post('/analyze-wound', protect, upload.single('image'), uploadWoundAnalysis);
router.post('/disaster-advice', protect, getDisasterAdvisory);

module.exports = router;
