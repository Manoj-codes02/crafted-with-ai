const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add contact name'],
    },
    relation: {
      type: String,
      required: [true, 'Please add relationship'],
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    email: {
      type: String,
      default: '',
    },
    isSOS: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
