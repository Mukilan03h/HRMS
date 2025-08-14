import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Link,
  Divider,
} from '@mui/material';

// Note: The server must be configured to serve static files from the 'uploads' directory.
// Example in Express: app.use('/uploads', express.static('uploads'));

const ApplicationDetailsModal = ({ application, open, onClose }) => {
  if (!application) {
    return null;
  }

  const { personal, contact, bank, emergency, documents, createdAt } = application;
  const API_URL = 'http://localhost:5000'; // This should ideally be in an env file

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Onboarding Application Details</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Personal Information</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {personal.firstName} {personal.lastName}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Date of Birth:</strong> {new Date(personal.dateOfBirth).toLocaleDateString()}</Typography></Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Contact Details</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {contact.email}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Phone:</strong> {contact.phone}</Typography></Grid>
            <Grid item xs={12}><Typography><strong>Address:</strong> {contact.address}</Typography></Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Bank Information</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Account Number:</strong> {bank.accountNumber}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>IFSC Code:</strong> {bank.ifscCode}</Typography></Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {emergency.name}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Relationship:</strong> {emergency.relationship}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography><strong>Phone:</strong> {emergency.phone}</Typography></Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
          <Grid container spacing={1}>
            <Grid item xs={12}><Link href={`${API_URL}/${documents.idProof}`} target="_blank" rel="noopener noreferrer">View ID Proof</Link></Grid>
            <Grid item xs={12}><Link href={`${API_URL}/${documents.addressProof}`} target="_blank" rel="noopener noreferrer">View Address Proof</Link></Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplicationDetailsModal;
