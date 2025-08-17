import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  // Check for token existence as well, since context might not be updated instantly on page refresh
  const hasToken = !!localStorage.getItem('token');

  if (!isAuthenticated && !hasToken) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/login" replace />;
  }

  // If password change is required, redirect to the change password page
  // unless they are already on that page.
  if (user?.passwordChangeRequired && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Check if route has role restrictions
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // user's role is not authorized
    return <Navigate to="/" replace />; // Or to a specific '/unauthorized' page
  }

  return <Outlet />;
};

export default ProtectedRoute;
