const fs = require('fs');
const path = require('path');
const Assessment = require('../models/Assessment');
const MedicalProfile = require('../models/MedicalProfile');
const { analyzeSymptomsText, analyzeWoundImage, getDisasterAdvice } = require('../services/geminiService');

// @desc    Analyze symptoms text
// @route   POST /api/ai/analyze
// @access  Private
const analyzeSymptoms = async (req, res, next) => {
  try {
    const { age, gender, symptoms, painLevel, duration, medicalHistory, allergies, medications } = req.body;

    if (!age || !gender || !symptoms || !painLevel || !duration) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const userId = req.user._id;

    // Call Gemini API Service
    const aiResponse = await analyzeSymptomsText({
      age,
      gender,
      symptoms,
      painLevel,
      duration,
      medicalHistory,
      allergies,
      medications,
    });

    // Save in Database
    const assessment = await Assessment.create({
      userId,
      age: parseInt(age),
      gender,
      symptoms,
      painLevel: parseInt(painLevel),
      duration,
      medicalHistory: medicalHistory || '',
      allergies: allergies || '',
      medications: medications || '',
      riskLevel: aiResponse.severity,
      aiResponse,
    });

    res.status(201).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze injury wound image
// @route   POST /api/ai/analyze-wound
// @access  Private
const uploadWoundAnalysis = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }

    const { description, age, gender, painLevel, duration } = req.body;
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = req.file.mimetype;

    // Get medical profile to feed into Gemini context
    const medicalProfile = await MedicalProfile.findOne({ userId: req.user._id });
    
    // Add additional context if available
    let detailedDesc = description || '';
    if (medicalProfile) {
      detailedDesc += `\nPatient context: Blood Group: ${medicalProfile.bloodGroup || 'Unknown'}. Allergies: ${medicalProfile.allergies.join(', ') || 'None'}. Chronic Diseases: ${medicalProfile.chronicDiseases.join(', ') || 'None'}.`;
    }

    // Call Gemini Multimodal Service
    const aiResponse = await analyzeWoundImage(fileBuffer, mimeType, detailedDesc);

    // Save Assessment
    const relativePath = `/uploads/${path.basename(filePath)}`;
    
    const assessment = await Assessment.create({
      userId: req.user._id,
      age: age ? parseInt(age) : 30, 
      gender: gender || 'Unknown',
      symptoms: description || 'Visual assessment of wound/burn image.',
      painLevel: painLevel ? parseInt(painLevel) : 5,
      duration: duration || 'N/A',
      medicalHistory: medicalProfile ? medicalProfile.chronicDiseases.join(', ') : '',
      allergies: medicalProfile ? medicalProfile.allergies.join(', ') : '',
      medications: medicalProfile ? medicalProfile.currentMedications.join(', ') : '',
      riskLevel: aiResponse.severity,
      aiResponse,
      imageUrl: relativePath,
    });

    res.status(201).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get disaster advisory guidance
// @route   POST /api/ai/disaster-advice
// @access  Private
const getDisasterAdvisory = async (req, res, next) => {
  try {
    const { category, situation } = req.body;

    if (!category) {
      res.status(400);
      throw new Error('Disaster category is required');
    }

    const advice = await getDisasterAdvice(category, situation);

    res.json({
      success: true,
      data: advice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSymptoms,
  uploadWoundAnalysis,
  getDisasterAdvisory,
};
