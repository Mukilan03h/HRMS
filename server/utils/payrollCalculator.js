const moment = require('moment');
const Attendance = require('../models/Attendance');
const LoanRequest = require('../models/LoanRequest');
const User = require('../models/User');

// --- Assumptions ---
const BASE_MONTHLY_SALARY = 30000;
const WORKING_DAYS_IN_MONTH = 26; // Assuming a 6-day work week, 4 weeks
const PER_DAY_RATE = BASE_MONTHLY_SALARY / WORKING_DAYS_IN_MONTH;

async function calculatePayroll(userId, year, month) {
  const startDate = moment({ year, month: month - 1 }).startOf('month');
  const endDate = moment({ year, month: month - 1 }).endOf('month');

  // 1. Fetch all necessary data for the month
  const attendances = await Attendance.find({
    user: userId,
    date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
    isApproved: true, // Only consider approved attendance
  });

  const loans = await LoanRequest.find({
      user: userId,
      status: 'Approved'
  });

  // 2. Calculate deductions and additions
  let presentDays = 0;
  attendances.forEach(att => {
      if (att.status === 'Present') presentDays++;
      if (att.status === 'Half Day') presentDays += 0.5;
  });

  const unpaidDays = WORKING_DAYS_IN_MONTH - presentDays;
  const unpaidLeaveDeduction = unpaidDays > 0 ? unpaidDays * PER_DAY_RATE : 0;

  // Simple loan deduction: find first pending repayment for the month
  let loanRepayment = 0;
  for (const loan of loans) {
      const pendingRepayment = loan.repaymentSchedule.find(r => r.status === 'Pending');
      if (pendingRepayment) {
          loanRepayment += pendingRepayment.amount;
          // In a real app, you'd mark this installment as 'Paid' after payroll is approved.
          break; // For simplicity, only handle one loan repayment per month
      }
  }

  // 3. Calculate net salary
  const grossSalary = BASE_MONTHLY_SALARY; // Start with the base
  const totalDeductions = unpaidLeaveDeduction + loanRepayment;
  const netSalary = grossSalary - totalDeductions;

  return {
    user: userId,
    month,
    year,
    basicSalary: grossSalary,
    additions: {
      odAllowance: 0, // Placeholder
    },
    deductions: {
      unpaidLeave: unpaidLeaveDeduction,
      loanRepayment: loanRepayment,
    },
    netSalary: netSalary,
  };
}

module.exports = calculatePayroll;
