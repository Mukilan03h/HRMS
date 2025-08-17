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
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Link,
  CircularProgress
} from '@mui/material';

function AdminDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [onDutyLogs, setOnDutyLogs] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // State for dialogs
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusForTab = () => {
    const role = user?.role;
    if (mainTab !== 0) return '';

    if (role === 'Admin') {
        switch (subTab) {
            case 0: return 'PendingAdmin';
            case 1: return 'Rejected';
            default: return '';
        }
    }
    if (role === 'SuperAdmin') {
        switch (subTab) {
            case 0: return 'PendingSuperAdmin';
            case 1: return 'Approved';
            case 2: return 'Rejected';
            default: return '';
        }
    }
    return '';
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        switch (mainTab) {
            case 0: // Onboarding
                const status = getStatusForTab();
                if (status) {
                    const res = await axios.get(`/api/admin/applications?status=${status}`);
                    setApplications(res.data);
                }
                break;
            case 1: // On-Duty
                // TODO: Implement On-Duty fetch
                break;
            case 2: // Loans
                // TODO: Implement Loans fetch
                break;
            case 3: // Payroll
                const today = new Date();
                const res = await axios.get(`/api/payroll/payslips?year=${today.getFullYear()}&month=${today.getMonth() + 1}`);
                setPayslips(res.data);
                break;
            default:
                break;
        }
    } catch (err) {
        console.error('Failed to fetch data', err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [user, mainTab, subTab]);

  const handleOpenDetail = (app) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => setIsDetailOpen(false);
  const handleOpenReject = () => {
    setIsRejectOpen(true);
  };
  const handleCloseReject = () => {
    setIsRejectOpen(false);
  };

  const handleApproveOnboarding = async () => {
    if (!selectedApp) return;
    try {
      await axios.post(`/api/admin/applications/${selectedApp._id}/approve`);
      fetchData();
      handleCloseDetail();
    } catch (err) { alert('Failed to approve application: ' + err.response?.data?.msg); }
  };

  const handleRejectOnboarding = async () => {
    if (!selectedApp || !rejectionReason) {
        alert('Rejection reason is required.');
        return;
    }
    try {
      await axios.post(`/api/admin/applications/${selectedApp._id}/reject`, { reason: rejectionReason });
      setRejectionReason('');
      fetchData();
      handleCloseReject();
      handleCloseDetail();
    } catch (err) { alert('Failed to reject application: ' + err.response?.data?.msg); }
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
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Submitted At</TableCell></TableRow></TableHead>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
          ) : applications.map((app) => (
            <TableRow key={app._id} hover onClick={() => handleOpenDetail(app)} sx={{ cursor: 'pointer' }}>
              <TableCell>{app.personal.firstName} {app.personal.lastName}</TableCell>
              <TableCell>{app.contact.email}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
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
    // TODO: Implement Loan Table
    <Typography sx={{mt: 2}}>Loan requests table will be here.</Typography>
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
                {user?.role === 'Admin' && [<Tab key="pr" label="Pending Review" />, <Tab key="ar" label="Rejected" />]}
                {user?.role === 'SuperAdmin' && [<Tab key="psa" label="Pending Final Approval" />, <Tab key="sa" label="Approved" />, <Tab key="sr" label="Rejected" />]}
            </Tabs>
          </Box>
      )}

      {renderContent()}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onClose={handleCloseDetail} fullWidth maxWidth="md">
        <DialogTitle>Onboarding Application Details</DialogTitle>
        <DialogContent>
          {selectedApp && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}><Typography variant="h6">Personal Details</Typography></Grid>
              <Grid item xs={6}><b>Name:</b> {selectedApp.personal.firstName} {selectedApp.personal.lastName}</Grid>
              <Grid item xs={6}><b>DOB:</b> {new Date(selectedApp.personal.dateOfBirth).toLocaleDateString()}</Grid>

              <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Contact Details</Typography></Grid>
              <Grid item xs={6}><b>Email:</b> {selectedApp.contact.email}</Grid>
              <Grid item xs={6}><b>Phone:</b> {selectedApp.contact.phone}</Grid>
              <Grid item xs={12}><b>Address:</b> {selectedApp.contact.address}</Grid>

              <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Bank Details</Typography></Grid>
              <Grid item xs={6}><b>Account #:</b> {selectedApp.bank.accountNumber}</Grid>
              <Grid item xs={6}><b>IFSC:</b> {selectedApp.bank.ifscCode}</Grid>

              <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Emergency Contact</Typography></Grid>
              <Grid item xs={4}><b>Name:</b> {selectedApp.emergency.name}</Grid>
              <Grid item xs={4}><b>Relationship:</b> {selectedApp.emergency.relationship}</Grid>
              <Grid item xs={4}><b>Phone:</b> {selectedApp.emergency.phone}</Grid>

              <Grid item xs={12}><Typography variant="h6" sx={{ mt: 2 }}>Documents</Typography></Grid>
              <Grid item xs={6}><Link href={`/${selectedApp.documents.idProof}`} target="_blank" rel="noopener">View ID Proof</Link></Grid>
              <Grid item xs={6}><Link href={`/${selectedApp.documents.addressProof}`} target="_blank" rel="noopener">View Address Proof</Link></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Close</Button>
          {selectedApp?.status.startsWith('Pending') && (
            <Box>
              <Button variant="contained" color="error" onClick={handleOpenReject} sx={{ mr: 1 }}>Reject</Button>
              <Button variant="contained" color="success" onClick={handleApproveOnboarding}>Approve</Button>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={isRejectOpen} onClose={handleCloseReject}>
        <DialogTitle>Reject Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            variant="standard"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReject}>Cancel</Button>
          <Button onClick={handleRejectOnboarding} color="error">Submit Rejection</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboardPage;
