import { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import AttendancePage from './pages/AttendancePage';
import OnDutyPage from './pages/OnDutyPage';
import LoanPage from './pages/LoanPage';
import PayslipPage from './pages/PayslipPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordEnforcer from './components/PasswordEnforcer';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function App() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PasswordEnforcer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HRM Solution
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/onboarding">Onboarding</Button>

          {isAuthenticated ? (
            <Box>
              {/* Add dashboard links based on role */}
              {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
                <Button color="inherit" component={Link} to="/admin/dashboard">Admin Dashboard</Button>
              )}
              {user?.role === 'Employee' && (
                <>
                  <Button color="inherit" component={Link} to="/dashboard">My Dashboard</Button>
                  <Button color="inherit" component={Link} to="/attendance">Attendance</Button>
                  <Button color="inherit" component={Link} to="/onduty">On-Duty</Button>
                  <Button color="inherit" component={Link} to="/loan">Apply for Loan</Button>
                </>
              )}
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </Box>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute roles={['Admin', 'SuperAdmin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          {/* Protected Employee Routes */}
          <Route element={<ProtectedRoute roles={['Employee']} />}>
            <Route path="/dashboard" element={<EmployeeDashboardPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/onduty" element={<OnDutyPage />} />
            <Route path="/loan" element={<LoanPage />} />
          </Route>
        </Routes>
      </Container>
    </PasswordEnforcer>
  );
}

export default App;
