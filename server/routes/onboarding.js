const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const OnboardingApplication = require('../models/OnboardingApplication');

// --- Multer Configuration for File Uploads ---

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwriting
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
]);

// Check File Type function
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDFs, JPEGs, or PNGs Only!');
  }
}


// --- API Routes ---

// @route   POST /api/onboarding/submit
// @desc    Submit a new onboarding application
// @access  Public
router.post('/submit', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        }

        // Check if files were uploaded
        if (req.files.idProof === undefined || req.files.addressProof === undefined) {
            return res.status(400).json({ msg: 'Error: Both ID proof and Address proof are required.' });
        }

        try {
            const {
                firstName, lastName, dateOfBirth,
                email, phone, address,
                accountNumber, ifscCode,
                emergencyName, emergencyRelationship, emergencyPhone
            } = req.body;

            // Simple validation
            if (!firstName || !email || !phone) {
                return res.status(400).json({ msg: 'Please fill out all required fields.' });
            }

            const newApplication = new OnboardingApplication({
                personal: { firstName, lastName, dateOfBirth },
                contact: { email, phone, address },
                bank: { accountNumber, ifscCode },
                emergency: { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone },
                documents: {
                    idProof: req.files.idProof[0].path,
                    addressProof: req.files.addressProof[0].path,
                }
            });

            await newApplication.save();

            res.status(201).json({
                msg: 'Application submitted successfully. You will be notified once it is reviewed.',
                application: newApplication
            });

        } catch (error) {
            console.error(error.message);
            // Check for duplicate email error
            if (error.code === 11000) {
                return res.status(400).json({ msg: 'An application with this email already exists.' });
            }
            res.status(500).send('Server Error');
        }
    });
});

module.exports = router;
