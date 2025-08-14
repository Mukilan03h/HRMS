import { Typography, Container } from '@mui/material';

function HomePage() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the HRM Solution
      </Typography>
      <Typography variant="body1">
        This is the main portal for managing HR processes for construction sites.
      </Typography>
    </Container>
  );
}

export default HomePage;
