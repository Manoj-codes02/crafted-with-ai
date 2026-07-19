const express = require('express');
const router = express.Router();
const { getAssessmentHistory, deleteAssessment, getAnalyticsData } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAssessmentHistory);
router.get('/analytics', protect, getAnalyticsData);
router.delete('/:id', protect, deleteAssessment);

module.exports = router;
