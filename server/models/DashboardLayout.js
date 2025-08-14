const mongoose = require('mongoose');

const DashboardLayoutSchema = new mongoose.Schema({
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    unique: true,
  },
  layout: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    // Example: { widgets: ['attendance_summary', 'pending_loans'] }
  },
}, {
  timestamps: true,
});

const DashboardLayout = mongoose.model('DashboardLayout', DashboardLayoutSchema);
module.exports = DashboardLayout;
