const mongoose = require('mongoose');

const RepaymentSchema = new mongoose.Schema({
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
});

const LoanRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Site GM
  },
  rejectionReason: {
      type: String,
  },
  repaymentSchedule: [RepaymentSchema]
}, {
  timestamps: true,
});

const LoanRequest = mongoose.model('LoanRequest', LoanRequestSchema);

module.exports = LoanRequest;
