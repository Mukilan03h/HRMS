const mongoose = require('mongoose');

// GeoJSON Point Schema for storing GPS coordinates
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
  },
  checkOutTime: {
    type: Date,
  },
  checkInLocation: {
    type: pointSchema,
  },
  checkOutLocation: {
    type: pointSchema,
  },
  checkInImage: {
    type: String, // Path to check-in selfie
  },
  checkOutImage: {
    type: String, // Path to check-out selfie
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'On Leave', 'OD', 'Half Day'],
    required: true,
  },
  site: { // To associate attendance with a specific construction site
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site' // Assuming a 'Site' model will exist
  },
  approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Site GM
  },
  isApproved: {
      type: Boolean,
      default: false
  }
}, {
  timestamps: true,
});

// To prevent a user from having multiple attendance records for the same day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', AttendanceSchema);

module.exports = Attendance;
