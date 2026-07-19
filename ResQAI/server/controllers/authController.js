const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MedicalProfile = require('../models/MedicalProfile');
const EmergencyContact = require('../models/EmergencyContact');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'resqai_secret_123456', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // Create empty medical profile
      await MedicalProfile.create({
        userId: user._id,
      });

      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get medical profile
// @route   GET /api/auth/medical-profile
// @access  Private
const getMedicalProfile = async (req, res, next) => {
  try {
    let profile = await MedicalProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Create if it doesn't exist for some reason
      profile = await MedicalProfile.create({
        userId: req.user._id,
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical profile
// @route   PUT /api/auth/medical-profile
// @access  Private
const updateMedicalProfile = async (req, res, next) => {
  try {
    const { bloodGroup, allergies, chronicDiseases, currentMedications, insuranceProvider, insurancePolicyNo } = req.body;

    let profile = await MedicalProfile.findOne({ userId: req.user._id });

    if (!profile) {
      profile = new MedicalProfile({ userId: req.user._id });
    }

    profile.bloodGroup = bloodGroup || profile.bloodGroup;
    profile.allergies = allergies || profile.allergies;
    profile.chronicDiseases = chronicDiseases || profile.chronicDiseases;
    profile.currentMedications = currentMedications || profile.currentMedications;
    profile.insuranceProvider = insuranceProvider !== undefined ? insuranceProvider : profile.insuranceProvider;
    profile.insurancePolicyNo = insurancePolicyNo !== undefined ? insurancePolicyNo : profile.insurancePolicyNo;

    const updatedProfile = await profile.save();

    res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency contacts
// @route   GET /api/auth/contacts
// @access  Private
const getEmergencyContacts = async (req, res, next) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.user._id });
    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create emergency contact
// @route   POST /api/auth/contacts
// @access  Private
const createEmergencyContact = async (req, res, next) => {
  try {
    const { name, relation, phone, email, isSOS } = req.body;

    if (!name || !relation || !phone) {
      res.status(400);
      throw new Error('Name, relationship, and phone are required');
    }

    const contact = await EmergencyContact.create({
      userId: req.user._id,
      name,
      relation,
      phone,
      email: email || '',
      isSOS: isSOS !== undefined ? isSOS : true,
    });

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/auth/contacts/:id
// @access  Private
const deleteEmergencyContact = async (req, res, next) => {
  try {
    const contact = await EmergencyContact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      res.status(404);
      throw new Error('Contact not found');
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Contact removed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getMedicalProfile,
  updateMedicalProfile,
  getEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
};
