import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

function OnDutyPage() {
  const [formData, setFormData] = useState({
    clientName: '',
    purpose: '',
    date: new Date().toISOString().split('T')[0], // Defaults to today
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { clientName, purpose, date } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Get location first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.post('/api/onduty/request', { ...formData, latitude, longitude });
          setSuccess('On-Duty request submitted successfully!');
        } catch (err) {
          setError(err.response?.data?.msg || 'Failed to submit request.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(`Could not get location: ${err.message}`);
        setLoading(false);
      }
    );
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Submit On-Duty Request
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            name="clientName"
            label="Client Name"
            value={clientName}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="purpose"
            label="Purpose of Visit"
            multiline
            rows={4}
            value={purpose}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="date"
            label="Date"
            type="date"
            value={date}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Request'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default OnDutyPage;
