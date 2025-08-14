import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem('token');
          return;
        }
        // Fetch full user data
        const userRes = await axios.get('/api/employee/me');
        dispatch({ type: 'LOGIN', payload: { user: userRes.data.profile, token } });
      } catch (err) {
        // Invalid token or other error
        localStorage.removeItem('token');
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token } = res.data;
    localStorage.setItem('token', token);
    await loadUser(); // Load user data after setting token
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    setAuthToken(null);
  };

  const hasPermission = (requiredPermission) => {
    if (!state.user || !state.user.role || !Array.isArray(state.user.role.permissions)) {
      return false;
    }
    const userPermissions = state.user.role.permissions.map(p => p.name);
    return userPermissions.includes(requiredPermission);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper to set auth token for all axios requests
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};
