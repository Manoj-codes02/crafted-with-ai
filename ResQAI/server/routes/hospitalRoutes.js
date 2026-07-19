const express = require('express');
const router = express.Router();
const { searchHospitals } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchHospitals);

module.exports = router;
