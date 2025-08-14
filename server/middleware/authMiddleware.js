const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify token and attach user with permissions
async function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user and populate their role with its permissions
    const user = await User.findById(decoded.user.id).populate({
      path: 'role',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    }).select('-password');

    if (!user) {
        return res.status(401).json({ msg: 'Authorization denied, user not found.' });
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
}

// New middleware to check for a specific permission
function checkPermission(requiredPermission) {
    return (req, res, next) => {
        // The `auth` middleware should have already run and attached the user object.
        // We expect `req.user.role.permissions` to be an array of Permission documents.
        if (!req.user || !req.user.role || !Array.isArray(req.user.role.permissions)) {
            return res.status(403).json({ msg: 'Forbidden: User role and permissions are not defined.' });
        }

        const userPermissions = req.user.role.permissions.map(p => p.name);

        if (userPermissions.includes(requiredPermission)) {
            // User has the required permission, proceed to the next middleware/route handler
            return next();
        } else {
            // User does not have the required permission
            return res.status(403).json({ msg: 'Forbidden: You do not have the required permission.' });
        }
    };
}

module.exports = {
    auth,
    checkPermission
};
