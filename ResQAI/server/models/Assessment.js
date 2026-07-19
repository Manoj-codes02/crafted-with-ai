const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    painLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    medicalHistory: {
      type: String,
      default: '',
    },
    allergies: {
      type: String,
      default: '',
    },
    medications: {
      type: String,
      default: '',
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'Critical'],
      required: true,
    },
    aiResponse: {
      severity: String,
      confidence: Number,
      possible_conditions: [String],
      reasoning: String,
      first_aid: [String],
      next_steps: [String],
      warning_signs: [String],
      hospital_needed: Boolean,
      ambulance_required: Boolean,
      estimated_priority: String,
      disclaimer: String,
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
