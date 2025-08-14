const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const calculatePayroll = require('../utils/payrollCalculator');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LoanRequest = require('../models/LoanRequest');

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user
  testUser = new User({ name: 'Payroll User', email: 'payroll@example.com', password: 'password' });
  await testUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
    // Clean up collections
    await Attendance.deleteMany({});
    await LoanRequest.deleteMany({});
});

describe('Payroll Calculator', () => {
  it('should calculate salary correctly with full attendance and no loans', async () => {
    // Create 26 'Present' attendance records for the user
    for (let i = 1; i <= 26; i++) {
        await new Attendance({ user: testUser._id, date: new Date(2024, 7, i), status: 'Present', isApproved: true }).save();
    }

    const payroll = await calculatePayroll(testUser._id, 2024, 8);

    expect(payroll.basicSalary).toBe(30000);
    expect(payroll.deductions.unpaidLeave).toBe(0);
    expect(payroll.deductions.loanRepayment).toBe(0);
    expect(payroll.netSalary).toBe(30000);
  });

  it('should calculate salary with deductions for unpaid leave', async () => {
    // Create 20 'Present' attendance records (6 days unpaid)
    for (let i = 1; i <= 20; i++) {
        await new Attendance({ user: testUser._id, date: new Date(2024, 7, i), status: 'Present', isApproved: true }).save();
    }

    const payroll = await calculatePayroll(testUser._id, 2024, 8);
    const perDayRate = 30000 / 26;
    const expectedDeduction = 6 * perDayRate;

    expect(payroll.deductions.unpaidLeave).toBeCloseTo(expectedDeduction);
    expect(payroll.netSalary).toBeCloseTo(30000 - expectedDeduction);
  });

  it('should calculate salary with deductions for a loan', async () => {
    // Full attendance
    for (let i = 1; i <= 26; i++) {
        await new Attendance({ user: testUser._id, date: new Date(2024, 7, i), status: 'Present', isApproved: true }).save();
    }
    // Create an approved loan with a pending repayment
    await new LoanRequest({
        user: testUser._id,
        amount: 5000,
        reason: 'Test',
        status: 'Approved',
        repaymentSchedule: [{ dueDate: new Date(), amount: 1000, status: 'Pending' }]
    }).save();

    const payroll = await calculatePayroll(testUser._id, 2024, 8);

    expect(payroll.deductions.loanRepayment).toBe(1000);
    expect(payroll.netSalary).toBe(29000);
  });
});
