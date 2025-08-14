import { useState } from 'react';
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  TextField,
  Grid
} from '@mui/material';
import axios from 'axios';

const steps = [
  'Personal Details',
  'Contact Details',
  'Bank Details',
  'Emergency Contact',
  'Document Upload',
  'Review & Submit',
];

function OnboardingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    accountNumber: '',
    ifscCode: '',
    emergencyName: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    idProof: null,
    addressProof: null,
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();
    // Append all form data
    Object.keys(formData).forEach(key => {
        submissionData.append(key, formData[key]);
    });

    try {
        const res = await axios.post('/api/onboarding/submit', submissionData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(res.data);
        alert('Application submitted successfully!');
        // Go to final step
        setActiveStep(steps.length);
    } catch (err) {
        console.error(err.response.data);
        alert('Error submitting application: ' + err.response.data.msg);
    }
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField name="firstName" label="First Name" fullWidth onChange={handleChange} value={formData.firstName} /></Grid>
            <Grid item xs={12} sm={6}><TextField name="lastName" label="Last Name" fullWidth onChange={handleChange} value={formData.lastName} /></Grid>
            <Grid item xs={12}><TextField name="dateOfBirth" label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.dateOfBirth} /></Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField name="email" label="Email" type="email" fullWidth onChange={handleChange} value={formData.email} /></Grid>
            <Grid item xs={12} sm={6}><TextField name="phone" label="Phone Number" fullWidth onChange={handleChange} value={formData.phone} /></Grid>
            <Grid item xs={12}><TextField name="address" label="Address" fullWidth multiline rows={3} onChange={handleChange} value={formData.address} /></Grid>
          </Grid>
        );
      case 2:
        return (
           <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField name="accountNumber" label="Bank Account Number" fullWidth onChange={handleChange} value={formData.accountNumber} /></Grid>
            <Grid item xs={12} sm={6}><TextField name="ifscCode" label="IFSC Code" fullWidth onChange={handleChange} value={formData.ifscCode} /></Grid>
          </Grid>
        );
      case 3:
         return (
           <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField name="emergencyName" label="Emergency Contact Name" fullWidth onChange={handleChange} value={formData.emergencyName} /></Grid>
            <Grid item xs={12} sm={6}><TextField name="emergencyRelationship" label="Relationship" fullWidth onChange={handleChange} value={formData.emergencyRelationship} /></Grid>
            <Grid item xs={12}><TextField name="emergencyPhone" label="Emergency Contact Phone" fullWidth onChange={handleChange} value={formData.emergencyPhone} /></Grid>
          </Grid>
        );
      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle1">ID Proof (PDF, JPG, PNG)</Typography>
                <TextField name="idProof" type="file" fullWidth onChange={handleFileChange} />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">Address Proof (PDF, JPG, PNG)</Typography>
                <TextField name="addressProof" type="file" fullWidth onChange={handleFileChange} />
            </Grid>
          </Grid>
        );
      case 5:
        return <Typography>Review your details and submit.</Typography>;
      default:
        return 'Unknown step';
    }
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Employee Onboarding
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <Box>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - your application has been submitted.
          </Typography>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>{getStepContent(activeStep)}</Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            {activeStep === steps.length - 1 ? (
              <Button type="submit" variant="contained">
                Submit Application
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            )}
          </Box>
        </form>
      )}
    </Container>
  );
}

export default OnboardingPage;
