const express = require('express');
const router = express.Router();
const OnboardingApplication = require('../models/OnboardingApplication');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/email');

// @route   GET /api/admin/applications
// @desc    Get all onboarding applications based on status
// @access  Private (Admin, SuperAdmin)
router.get(
  '/applications',
  [auth, authorize(['Admin', 'SuperAdmin'])],
  async (req, res) => {
    try {
      const { status } = req.query;
      const query = status ? { status } : {};
      const applications = await OnboardingApplication.find(query).sort({ createdAt: -1 });
      res.json(applications);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST /api/admin/applications/:id/approve
// @desc    Approve an onboarding application
// @access  Private (Admin, SuperAdmin)
router.post(
  '/applications/:id/approve',
  [auth, authorize(['Admin', 'SuperAdmin'])],
  async (req, res) => {
    try {
      const application = await OnboardingApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ msg: 'Application not found' });
      }

      const userRole = req.user.role;

      if (userRole === 'Admin' && application.status === 'PendingAdmin') {
        application.status = 'PendingSuperAdmin';
        await application.save();
        return res.json(application);
      }

      if (userRole === 'SuperAdmin' && application.status === 'PendingSuperAdmin') {
        // Final approval: Create user account
        const { personal, contact } = application;
        const tempPassword = 'Welcome123'; // In a real app, generate a random one

        const newUser = new User({
          name: `${personal.firstName} ${personal.lastName}`,
          email: contact.email,
          password: tempPassword,
          role: 'Employee',
          passwordChangeRequired: true,
        });
        await newUser.save();

        application.status = 'Approved';
        application.userAccount = newUser.id;
        await application.save();

        // Trigger "Welcome" email notification
        try {
          await sendEmail({
            email: contact.email,
            subject: 'Welcome to [Company Name]!',
            message: `Your account has been approved. You can log in with your email and this temporary password: ${tempPassword}\n\nPlease change your password upon first login.`,
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the whole request, but maybe log this for manual follow-up
        }

        return res.json({ msg: 'Application approved and user created.', application });
      }

      return res.status(403).json({ msg: 'Not authorized to approve this application at its current stage.' });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST /api/admin/applications/:id/reject
// @desc    Reject an onboarding application
// @access  Private (Admin, SuperAdmin)
router.post(
  '/applications/:id/reject',
  [auth, authorize(['Admin', 'SuperAdmin'])],
  async (req, res) => {
    try {
      const { reason } = req.body;
      if (!reason) {
          return res.status(400).json({ msg: 'Rejection reason is required.' });
      }

      const application = await OnboardingApplication.findByIdAndUpdate(
        req.params.id,
        { status: 'Rejected', rejectionReason: reason },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({ msg: 'Application not found' });
      }

      // Trigger "Missing Info" email notification
      try {
        await sendEmail({
          email: application.contact.email,
          subject: 'Action Required: Complete Your Onboarding Form',
          message: `Your onboarding application has been reviewed, but it requires corrections. The reason provided was: "${reason}". Please contact HR to correct and resubmit.`,
        });
      } catch (emailError) {
          console.error('Failed to send rejection email:', emailError);
      }

      res.json(application);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
