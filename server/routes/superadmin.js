const express = require('express');
const router = express.Router();
const { auth, checkPermission } = require('../middleware/authMiddleware');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');
const DashboardLayout = require('../models/DashboardLayout');

// @route   GET /api/superadmin/permissions
// @desc    Get all available permissions
// @access  Private (requires 'role:manage' permission)
router.get('/permissions', [auth, checkPermission('role:manage')], async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ name: 1 });
    res.json(permissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/superadmin/roles
// @desc    Get all roles
// @access  Private (requires 'role:manage' permission)
router.get('/roles', [auth, checkPermission('role:manage')], async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions');
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/superadmin/roles
// @desc    Create a new role
// @access  Private (requires 'role:manage' permission)
router.post('/roles', [auth, checkPermission('role:manage')], async (req, res) => {
  const { name, permissions } = req.body;

  try {
    // Basic validation
    if (!name) {
      return res.status(400).json({ msg: 'Role name is required.' });
    }

    let role = await Role.findOne({ name });
    if (role) {
      return res.status(400).json({ msg: 'A role with this name already exists.' });
    }

    role = new Role({
      name,
      permissions,
    });

    await role.save();
    res.status(201).json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/superadmin/roles/:id
// @desc    Update a role's name and permissions
// @access  Private (requires 'role:manage' permission)
router.put('/roles/:id', [auth, checkPermission('role:manage')], async (req, res) => {
  const { name, permissions } = req.body;

  try {
    let role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ msg: 'Role not found.' });
    }

    // Update fields
    if (name) role.name = name;
    if (permissions) role.permissions = permissions;

    await role.save();
    res.json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/superadmin/roles/:id
// @desc    Delete a role
// @access  Private (requires 'role:manage' permission)
router.delete('/roles/:id', [auth, checkPermission('role:manage')], async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ msg: 'Role not found.' });
    }

    // Optional: Check if any users are assigned this role before deleting
    // const usersWithRole = await User.countDocuments({ role: req.params.id });
    // if (usersWithRole > 0) {
    //   return res.status(400).json({ msg: 'Cannot delete role. It is currently assigned to users.' });
    // }

    await role.deleteOne(); // Mongoose 5+
    res.json({ msg: 'Role removed successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- User Management ---

// @route   GET /api/superadmin/users
// @desc    Get all users
// @access  Private (requires 'user:read' permission)
router.get('/users', [auth, checkPermission('user:read')], async (req, res) => {
    try {
        const users = await User.find().populate('role', 'name').select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/superadmin/users/:id/assign-role
// @desc    Assign a role to a user
// @access  Private (requires 'user:assign_role' permission)
router.put('/users/:id/assign-role', [auth, checkPermission('user:assign_role')], async (req, res) => {
    const { roleId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ msg: 'Role not found.' });
        }

        user.role = roleId;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Dashboard Layout Management ---

// @route   GET /api/superadmin/layouts/:roleId
// @desc    Get dashboard layout for a specific role
// @access  Private (requires 'layout:manage' permission)
router.get('/layouts/:roleId', [auth, checkPermission('layout:manage')], async (req, res) => {
    try {
        let layout = await DashboardLayout.findOne({ role: req.params.roleId });
        if (!layout) {
            // If no layout exists, return a default empty layout
            return res.json({ role: req.params.roleId, layout: { widgets: [] } });
        }
        res.json(layout);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/superadmin/layouts/:roleId
// @desc    Create or Update dashboard layout for a specific role
// @access  Private (requires 'layout:manage' permission)
router.put('/layouts/:roleId', [auth, checkPermission('layout:manage')], async (req, res) => {
    const { layout } = req.body;
    try {
        const updatedLayout = await DashboardLayout.findOneAndUpdate(
            { role: req.params.roleId },
            { layout: layout },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(updatedLayout);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
