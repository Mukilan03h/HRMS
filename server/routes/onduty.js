const express = require('express');
const router = express.Router();
const { auth, checkPermission } = require('../middleware/authMiddleware');
const OnDutyLog = require('../models/OnDutyLog');

// @route   POST /api/onduty/request
// @desc    Submit an On-Duty request
// @access  Private (requires 'onduty:create' permission)
router.post('/request', [auth, checkPermission('onduty:create')], async (req, res) => {
  const { clientName, purpose, date, startTime, endTime, latitude, longitude } = req.body;

  if (!clientName || !purpose || !date) {
    return res.status(400).json({ msg: 'Please provide all required fields.' });
  }

  try {
    const newLog = new OnDutyLog({
      user: req.user.id,
      clientName,
      purpose,
      date,
      startTime,
      endTime,
      startLocation: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/onduty/requests
// @desc    Get all On-Duty requests (for admins)
// @access  Private (requires 'onduty:read' permission)
router.get('/requests', [auth, checkPermission('onduty:read')], async (req, res) => {
    try {
        const requests = await OnDutyLog.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/onduty/:id/approve
// @desc    Approve an On-Duty request
// @access  Private (requires 'onduty:approve' permission)
router.post('/:id/approve', [auth, checkPermission('onduty:approve')], async (req, res) => {
    try {
        const log = await OnDutyLog.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved', approvedBy: req.user.id },
            { new: true }
        );
        if (!log) {
            return res.status(404).json({ msg: 'On-Duty log not found.' });
        }
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a reject route as well for completeness
router.post('/:id/reject', [auth, checkPermission('onduty:approve')], async (req, res) => {
    try {
        const log = await OnDutyLog.findByIdAndUpdate(
            req.params.id,
            { status: 'Rejected', approvedBy: req.user.id },
            { new: true }
        );
        if (!log) {
            return res.status(404).json({ msg: 'On-Duty log not found.' });
        }
        res.json(log);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
