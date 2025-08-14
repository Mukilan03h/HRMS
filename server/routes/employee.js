const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const OnboardingApplication = require('../models/OnboardingApplication');

// @route   GET /api/employee/me
// @desc    Get current user's profile and onboarding status
// @access  Private (Authenticated Users)
router.get('/me', auth, async (req, res) => {
  try {
    // 1. Get the user's profile
    // We select '-password' to exclude the password hash from the response
    const userProfile = await User.findById(req.user.id).select('-password');
    if (!userProfile) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // 2. Get the user's onboarding application details
    // We can find it using the email, which should be unique.
    const onboardingApp = await OnboardingApplication.findOne({ 'contact.email': userProfile.email });

    res.json({
      profile: userProfile,
      onboarding: onboardingApp, // This will be null if no application is found
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
