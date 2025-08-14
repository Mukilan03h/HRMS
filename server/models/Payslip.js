const mongoose = require('mongoose');

const PayslipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  month: {
    type: Number, // 1-12
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  basicSalary: { // The gross salary for the month
    type: Number,
    required: true,
  },
  additions: {
    odAllowance: { type: Number, default: 0 },
    // other additions can be added here
  },
  deductions: {
    unpaidLeave: { type: Number, default: 0 },
    loanRepayment: { type: Number, default: 0 },
    // other deductions
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PendingApproval', 'Approved', 'Paid'],
    default: 'PendingApproval',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // HR/Accounts
  },
}, {
  timestamps: true,
});

// A user should only have one payslip per month/year
PayslipSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', PayslipSchema);

module.exports = Payslip;
