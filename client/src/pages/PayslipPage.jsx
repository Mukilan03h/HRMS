import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';

function PayslipPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/payroll/mypayslips');
        setPayslips(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch payslips.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayslips();
    }
  }, [user]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        My Payslips
      </Typography>
      {payslips.length === 0 ? (
        <Typography>No payslips found.</Typography>
      ) : (
        <List>
          {payslips.map((p, index) => (
            <Paper key={p._id} sx={{ mb: 2 }}>
              <ListItem>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6">Payslip for {p.month}/{p.year}</Typography>
                  <Divider sx={{ my: 1 }}/>
                  <ListItemText primary="Gross Salary" secondary={`$${p.basicSalary.toFixed(2)}`} />
                  <ListItemText primary="OD Allowance" secondary={`$${p.additions.odAllowance.toFixed(2)}`} />
                  <ListItemText primary="Unpaid Leave Deduction" secondary={`-$${p.deductions.unpaidLeave.toFixed(2)}`} />
                  <ListItemText primary="Loan Repayment" secondary={`-$${p.deductions.loanRepayment.toFixed(2)}`} />
                  <Divider sx={{ my: 1 }}/>
                  <Typography variant="subtitle1">Net Salary: ${p.netSalary.toFixed(2)}</Typography>
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
}

export default PayslipPage;
