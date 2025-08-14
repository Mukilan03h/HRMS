const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // Example: 'user:create', 'onboarding:approve'
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Permission = mongoose.model('Permission', PermissionSchema);
module.exports = Permission;
