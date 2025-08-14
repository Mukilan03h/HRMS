const express = require('express');
const router = express.Router();
const { auth, checkPermission } = require('../middleware/authMiddleware');
const Payslip = require('../models/Payslip');
const User = require('../models/User');
const Role = require('../models/Role');
const calculatePayroll = require('../utils/payrollCalculator');

// @route   POST /api/payroll/run
// @desc    Run payroll for a specific month for all employees
// @access  Private (requires 'payroll:run' permission)
router.post('/run', [auth, checkPermission('payroll:run')], async (req, res) => {
    const { year, month } = req.body;
    if (!year || !month) {
        return res.status(400).json({ msg: 'Year and month are required.' });
    }

    try {
        // Find the 'Employee' role ID
        const employeeRole = await Role.findOne({ name: 'Employee' });
        if (!employeeRole) {
            return res.status(500).json({ msg: 'Default "Employee" role not found.' });
        }

        // Fetch all active employees with that role
        const employees = await User.find({ role: employeeRole._id });

        const payslips = [];
        for (const employee of employees) {
            const payslipData = await calculatePayroll(employee.id, year, month);

            // Use updateOne with upsert to avoid creating duplicates if payroll is run again
            await Payslip.updateOne(
                { user: employee.id, year, month },
                { $set: payslipData },
                { upsert: true }
            );
            payslips.push(payslipData);
        }

        res.json({ msg: `Payroll run initiated for ${payslips.length} employees.`, payslips });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payroll/payslips
// @desc    Get all payslips for a given month
// @access  Private (requires 'payroll:read' permission)
router.get('/payslips', [auth, checkPermission('payroll:read')], async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) {
        return res.status(400).json({ msg: 'Year and month query params are required.' });
    }
    try {
        const payslips = await Payslip.find({ year, month }).populate('user', 'name');
        res.json(payslips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/payroll/payslips/:id/approve
// @desc    Approve a single payslip
// @access  Private (requires 'payroll:approve' permission)
router.post('/payslips/:id/approve', [auth, checkPermission('payroll:approve')], async (req, res) => {
    try {
        const payslip = await Payslip.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved', approvedBy: req.user.id },
            { new: true }
        );
        if (!payslip) {
            return res.status(404).json({ msg: 'Payslip not found.' });
        }
        res.json(payslip);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/payroll/mypayslips
// @desc    Get my own payslips
// @access  Private (Authenticated Users)
router.get('/mypayslips', auth, async (req, res) => {
    try {
        const payslips = await Payslip.find({ user: req.user.id, status: 'Approved' }).sort({ year: -1, month: -1 });
        res.json(payslips);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
