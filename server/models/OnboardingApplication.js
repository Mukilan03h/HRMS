const mongoose = require('mongoose');

const OnboardingApplicationSchema = new mongoose.Schema({
  // Personal Details
  personal: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
  },
  // Contact Details
  contact: {
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  // Bank Details
  bank: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
  },
  // Emergency Contact
  emergency: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
  },
  // Document Uploads
  documents: {
    idProof: { type: String, required: true }, // Path to the uploaded file
    addressProof: { type: String, required: true }, // Path to the uploaded file
  },
  // Workflow Status
  status: {
    type: String,
    enum: ['PendingAdmin', 'PendingSuperAdmin', 'Approved', 'Rejected'],
    default: 'PendingAdmin',
  },
  rejectionReason: {
    type: String,
  },
  // Link to the final user account once created
  userAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const OnboardingApplication = mongoose.model('OnboardingApplication', OnboardingApplicationSchema);

module.exports = OnboardingApplication;
