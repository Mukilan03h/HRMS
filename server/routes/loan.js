const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddleware');
const LoanRequest = require('../models/LoanRequest');

// @route   POST /api/loan/request
// @desc    Submit a loan request
// @access  Private (Employee)
router.post('/request', [auth, authorize('Employee')], async (req, res) => {
  const { amount, reason } = req.body;

  if (!amount || !reason || amount <= 0) {
    return res.status(400).json({ msg: 'Please provide a valid amount and reason.' });
  }

  try {
    const newRequest = new LoanRequest({
      user: req.user.id,
      amount,
      reason,
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/loan/requests
// @desc    Get all loan requests (for SiteGMs)
// @access  Private (SiteGM, Admin, SuperAdmin)
router.get('/requests', [auth, authorize(['SiteGM', 'Admin', 'SuperAdmin'])], async (req, res) => {
    try {
        const requests = await LoanRequest.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/loan/:id/approve
// @desc    Approve a loan request
// @access  Private (SiteGM)
router.post('/:id/approve', [auth, authorize(['SiteGM', 'Admin', 'SuperAdmin'])], async (req, res) => {
    try {
        // In a real app, repayment logic would be more complex
        const repaymentSchedule = [
            { dueDate: new Date(), amount: req.body.amount, status: 'Pending' }
        ];

        const loan = await LoanRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved', approvedBy: req.user.id, repaymentSchedule },
            { new: true }
        );
        if (!loan) {
            return res.status(404).json({ msg: 'Loan request not found.' });
        }
        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/loan/:id/reject
// @desc    Reject a loan request
// @access  Private (SiteGM)
router.post('/:id/reject', [auth, authorize(['SiteGM', 'Admin', 'SuperAdmin'])], async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
        return res.status(400).json({ msg: 'Rejection reason is required.' });
    }
    try {
        const loan = await LoanRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'Rejected', rejectionReason: reason },
            { new: true }
        );
        if (!loan) {
            return res.status(404).json({ msg: 'Loan request not found.' });
        }
        res.json(loan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
