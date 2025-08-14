const jwt = require('jsonwebtoken');

// IMPORTANT: Use the same secret key as in auth.js
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to verify token
function auth(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
}

// Middleware to check for specific roles
function authorize(roles = []) {
    // roles param can be a single role string (e.g., 'Admin')
    // or an array of roles (e.g., ['Admin', 'SuperAdmin'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            // user's role is not authorized
            return res.status(403).json({ msg: 'Forbidden: You do not have the required role.' });
        }

        // authentication and authorization successful
        next();
    };
}


module.exports = {
    auth,
    authorize
};
