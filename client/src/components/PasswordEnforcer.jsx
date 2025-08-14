import { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This component doesn't render anything itself.
// It just enforces a redirect if a password change is required.
const PasswordEnforcer = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.passwordChangeRequired && location.pathname !== '/change-password') {
      navigate('/change-password');
    }
  }, [user, navigate, location]);

  return children;
};

export default PasswordEnforcer;
