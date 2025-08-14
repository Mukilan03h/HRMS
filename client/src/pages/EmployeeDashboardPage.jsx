import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';

function EmployeeDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/employee/me');
        setDashboardData(res.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getStatusChip = (status) => {
    let color = 'default';
    if (status === 'Approved') color = 'success';
    if (status === 'Rejected') color = 'error';
    if (status?.startsWith('Pending')) color = 'warning';
    return <Chip label={status} color={color} />;
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {dashboardData?.profile?.name}
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>Onboarding Status</Typography>
        {dashboardData?.onboarding ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Your application status is:</Typography>
                {getStatusChip(dashboardData.onboarding.status)}
            </Box>
        ) : (
            <Typography>No onboarding application found.</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>Your Profile</Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Typography><strong>Name:</strong> {dashboardData?.profile?.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography><strong>Email:</strong> {dashboardData?.profile?.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography><strong>Role:</strong> {dashboardData?.profile?.role}</Typography>
            </Grid>
        </Grid>
        <Button
          component={Link}
          to="/change-password"
          variant="contained"
          sx={{ mt: 3 }}
        >
          Change Password
        </Button>
      </Paper>
    </Container>
  );
}

export default EmployeeDashboardPage;
