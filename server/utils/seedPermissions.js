require('dotenv').config();
const mongoose = require('mongoose');
const Permission = require('../models/Permission');

const permissions = [
  // User Management
  { name: 'user:create', description: 'Can create new user accounts' },
  { name: 'user:read', description: 'Can view user accounts' },
  { name: 'user:update', description: 'Can update user accounts' },
  { name: 'user:delete', description: 'Can delete user accounts' },
  { name: 'user:assign_role', description: 'Can assign roles to users' },

  // Onboarding Management
  { name: 'onboarding:read', description: 'Can view onboarding applications' },
  { name: 'onboarding:approve', description: 'Can approve onboarding applications' },
  { name: 'onboarding:reject', description: 'Can reject onboarding applications' },

  // Attendance Management
  { name: 'attendance:create', description: 'Can submit attendance records' },
  { name: 'attendance:read', description: 'Can view attendance records' },
  { name: 'attendance:approve', description: 'Can approve attendance records' },

  // On-Duty Management
  { name: 'onduty:create', description: 'Can submit on-duty requests' },
  { name: 'onduty:read', description: 'Can view on-duty requests' },
  { name: 'onduty:approve', description: 'Can approve on-duty requests' },

  // Loan Management
  { name: 'loan:create', description: 'Can apply for loans' },
  { name: 'loan:read', description: 'Can view loan applications' },
  { name: 'loan:approve', description: 'Can approve loan applications' },

  // Payroll Management
  { name: 'payroll:run', description: 'Can run payroll calculations' },
  { name: 'payroll:read', description: 'Can view payslips' },
  { name: 'payroll:approve', description: 'Can approve final payslips' },

  // SuperAdmin-only
  { name: 'role:manage', description: 'Can create, update, and delete roles and assign permissions' },
  { name: 'layout:manage', description: 'Can manage dashboard layouts for different roles' },
];

const seedPermissions = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    for (const p of permissions) {
      await Permission.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
    }

    console.log('Permissions have been successfully seeded.');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// Execute the seeder
seedPermissions();
