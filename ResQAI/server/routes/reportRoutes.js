const express = require('express');
const router = express.Router();
const { createReport, getReports, downloadReportPdf } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate/:assessmentId', protect, createReport);
router.get('/', protect, getReports);
router.get('/download/:id', protect, downloadReportPdf);

module.exports = router;
