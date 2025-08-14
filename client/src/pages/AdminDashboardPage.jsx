import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Tabs,
  Tab
} from '@mui/material';

function AdminDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [onDutyLogs, setOnDutyLogs] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    switch (mainTab) {
        case 0: // Onboarding
            // ... (existing code)
            break;
        case 1: // On-Duty
            // ... (existing code)
            break;
        case 2: // Loans
            // ... (existing code)
            break;
        case 3: // Payroll
            try {
                const today = new Date();
                const res = await axios.get(`/api/payroll/payslips?year=${today.getFullYear()}&month=${today.getMonth() + 1}`);
                setPayslips(res.data);
            } catch (err) { console.error('Failed to fetch payslips', err); }
            break;
        default:
            break;
    }
  };

  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [user, mainTab, subTab]);

  const handleApproveOnboarding = async (id) => {
    try {
      await axios.post(`/api/admin/applications/${id}/approve`);
      fetchData();
    } catch (err) { alert('Failed to approve application: ' + err.response?.data?.msg); }
  };

  const handleRejectOnboarding = async (id) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason) {
      try {
        await axios.post(`/api/admin/applications/${id}/reject`, { reason });
        fetchData();
      } catch (err) { alert('Failed to reject application: ' + err.response?.data?.msg); }
    }
  };

  const handleApproveOD = async (id) => {
      try {
          await axios.post(`/api/onduty/${id}/approve`);
          fetchData();
      } catch (err) { alert('Failed to approve OD log: ' + err.response?.data?.msg); }
  };

  const handleRejectOD = async (id) => {
      try {
          await axios.post(`/api/onduty/${id}/reject`);
          fetchData();
      } catch (err) { alert('Failed to reject OD log: ' + err.response?.data?.msg); }
  };

  const handleApproveLoan = async (id, amount) => {
      try {
          await axios.post(`/api/loan/${id}/approve`, { amount });
          fetchData();
      } catch (err) { alert('Failed to approve loan: ' + err.response?.data?.msg); }
  };

  const handleRejectLoan = async (id) => {
      const reason = prompt('Please enter reason for rejection:');
      if (reason) {
          try {
              await axios.post(`/api/loan/${id}/reject`, { reason });
              fetchData();
          } catch (err) { alert('Failed to reject loan: ' + err.response?.data?.msg); }
      }
  };

  const handleRunPayroll = async () => {
      const today = new Date();
      try {
          await axios.post('/api/payroll/run', { year: today.getFullYear(), month: today.getMonth() + 1 });
          fetchData();
          alert('Payroll run initiated successfully.');
      } catch (err) { alert('Failed to run payroll: ' + err.response?.data?.msg); }
  };

  const handleApprovePayslip = async (id) => {
      try {
          await axios.post(`/api/payroll/payslips/${id}/approve`);
          fetchData();
      } catch (err) { alert('Failed to approve payslip: ' + err.response?.data?.msg); }
  };

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
    setSubTab(0); // Reset sub-tab when changing main tab
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  const renderOnboardingTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Submitted At</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app._id}>
              <TableCell>{app.personal.firstName} {app.personal.lastName}</TableCell>
              <TableCell>{app.contact.email}</TableCell>
              <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {app.status.startsWith('Pending') && (
                  <Box><Button variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleApproveOnboarding(app._id)}>Approve</Button><Button variant="contained" color="error" onClick={() => handleRejectOnboarding(app._id)}>Reject</Button></Box>
                )}
                {app.status === 'Rejected' && <Typography color="error">Rejected: {app.rejectionReason}</Typography>}
                {app.status === 'Approved' && <Typography color="success">Approved</Typography>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderOnDutyTable = () => (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Client</TableCell><TableCell>Date</TableCell><TableCell>Purpose</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {onDutyLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.user.name}</TableCell>
                <TableCell>{log.clientName}</TableCell>
                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                <TableCell>{log.purpose}</TableCell>
                <TableCell>{log.status}</TableCell>
                <TableCell>
                  {log.status === 'Pending' && (
                    <Box><Button variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleApproveOD(log._id)}>Approve</Button><Button variant="contained" color="error" onClick={() => handleRejectOD(log._id)}>Reject</Button></Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );

  const renderLoanTable = () => (
    // ... existing code
  );

  const renderPayrollPanel = () => (
    <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleRunPayroll}>Run Payroll for Current Month</Button>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Month/Year</TableCell><TableCell>Net Salary</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                <TableBody>
                    {payslips.map((p) => (
                        <TableRow key={p._id}>
                            <TableCell>{p.user.name}</TableCell>
                            <TableCell>{p.month}/{p.year}</TableCell>
                            <TableCell>${p.netSalary.toFixed(2)}</TableCell>
                            <TableCell>{p.status}</TableCell>
                            <TableCell>
                                {p.status === 'PendingApproval' && <Button onClick={() => handleApprovePayslip(p._id)}>Approve</Button>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
  );

  const renderContent = () => {
      switch(mainTab) {
          case 0: return renderOnboardingTable();
          case 1: return renderOnDutyTable();
          case 2: return renderLoanTable();
          case 3: return renderPayrollPanel();
          default: return null;
      }
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>{user?.role} Dashboard</Typography>
      <Tabs value={mainTab} onChange={handleMainTabChange}>
          <Tab label="Onboarding" />
          <Tab label="On-Duty Logs" />
          <Tab label="Loan Requests" />
          {user?.role === 'HRAccounts' && <Tab label="Payroll" />}
      </Tabs>

      {mainTab === 0 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={subTab} onChange={handleSubTabChange}>
                {user?.role === 'Admin' && <Tab label="Pending Review" />}
                {user?.role === 'SuperAdmin' && <Tab label="Pending Final Approval" />}
                {user?.role === 'SuperAdmin' && <Tab label="Approved" />}
                <Tab label="Rejected" />
            </Tabs>
          </Box>
      )}

      {renderContent()}
    </Container>
  );
}

export default AdminDashboardPage;
