const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, checkPermission } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');
const moment = require('moment');

// --- Multer Configuration for Selfies ---
const storage = multer.diskStorage({
  destination: './uploads/selfies/', // Specific folder for selfies
  filename: function (req, file, cb) {
    cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('selfie'); // Expect a single file named 'selfie'


// @route   POST /api/attendance/check-in
// @desc    Employee checks in for the day
// @access  Private (requires 'attendance:create' permission)
router.post('/check-in', [auth, checkPermission('attendance:create')], (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    if (req.file === undefined) {
      return res.status(400).json({ msg: 'Error: No selfie image uploaded.' });
    }

    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({ msg: 'Location data is required.' });
    }

    try {
      const today = moment().startOf('day');
      // Check if already checked in today
      let attendance = await Attendance.findOne({
        user: req.user.id,
        date: {
          $gte: today.toDate(),
          $lt: moment(today).endOf('day').toDate()
        }
      });

      if (attendance) {
        return res.status(400).json({ msg: 'You have already checked in today.' });
      }

      attendance = new Attendance({
        user: req.user.id,
        date: new Date(),
        checkInTime: new Date(),
        checkInImage: req.file.path,
        checkInLocation: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        status: 'Present' // Default status on check-in
      });

      await attendance.save();
      res.json(attendance);

    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });
});


// @route   POST /api/attendance/check-out
// @desc    Employee checks out for the day
// @access  Private (requires 'attendance:create' permission)
router.post('/check-out', [auth, checkPermission('attendance:create')], (req, res) => {
    upload(req, res, async (err) => {
        if (err) { return res.status(400).json({ msg: err }); }
        if (req.file === undefined) { return res.status(400).json({ msg: 'Error: No selfie image uploaded.' }); }

        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) { return res.status(400).json({ msg: 'Location data is required.' }); }

        try {
            const today = moment().startOf('day');
            let attendance = await Attendance.findOne({
                user: req.user.id,
                date: {
                  $gte: today.toDate(),
                  $lt: moment(today).endOf('day').toDate()
                }
            });

            if (!attendance) { return res.status(404).json({ msg: 'No check-in found for today.' }); }
            if (attendance.checkOutTime) { return res.status(400).json({ msg: 'You have already checked out today.' }); }

            attendance.checkOutTime = new Date();
            attendance.checkOutImage = req.file.path;
            attendance.checkOutLocation = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };

            await attendance.save();
            res.json(attendance);

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    });
});


module.exports = router;
