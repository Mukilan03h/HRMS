const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Login & Role
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Employee', 'Admin', 'SuperAdmin', 'SiteGM', 'HRAccounts'],
    default: 'Employee',
  },
  passwordChangeRequired: {
    type: Boolean,
    default: false,
  },
  // Personal Details
  personal: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
  },
  // Contact Details
  contact: {
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
    idProof: { type: String }, // Path to the uploaded file
    addressProof: { type: String }, // Path to the uploaded file
  },
}, {
  timestamps: true,
});

// Pre-save hook to hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
