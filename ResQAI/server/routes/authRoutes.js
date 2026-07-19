const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getMedicalProfile,
  updateMedicalProfile,
  getEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/medical-profile', protect, getMedicalProfile);
router.put('/medical-profile', protect, updateMedicalProfile);
router.get('/contacts', protect, getEmergencyContacts);
router.post('/contacts', protect, createEmergencyContact);
router.delete('/contacts/:id', protect, deleteEmergencyContact);

module.exports = router;
