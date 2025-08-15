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
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';

function AdminDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [onDutyLogs, setOnDutyLogs] = useState([]);
  const [loanRequests, setLoanRequests] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const { user } = useContext(AuthContext);

  // State for dialogs and snackbar
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionInfo, setRejectionInfo] = useState({ id: null, handler: null, type: '' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    if (!user) return;
    // ... (fetchData logic remains the same)
    switch (mainTab) {
        case 0: try { let s = ''; if (user.role === 'Admin') s = ['PendingAdmin', 'Rejected'][subTab]; else if (user.role === 'SuperAdmin') s = ['PendingSuperAdmin', 'Approved', 'Rejected'][subTab]; const r = await axios.get(`/api/admin/applications?status=${s}`); setApplications(r.data); } catch (e) { console.error(e); setApplications([]); } break;
        case 1: try { const r = await axios.get('/api/onduty'); setOnDutyLogs(r.data); } catch (e) { console.error(e); setOnDutyLogs([]); } break;
        case 2: try { const r = await axios.get('/api/loan'); setLoanRequests(r.data); } catch (e) { console.error(e); setLoanRequests([]); } break;
        case 3: try { const t = new Date(); const r = await axios.get(`/api/payroll/payslips?year=${t.getFullYear()}&month=${t.getMonth() + 1}`); setPayslips(r.data); } catch (e) { console.error(e); } break;
        default: break;
    }
  };

  useEffect(() => { fetchData(); }, [user, mainTab, subTab]);

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // --- Generic Handlers ---
  const handleApprove = async (id, type) => {
    try {
      let url = '';
      if (type === 'onboarding') url = `/api/admin/applications/${id}/approve`;
      else if (type === 'od') url = `/api/onduty/${id}/approve`;
      else if (type === 'loan') url = `/api/loan/${id}/approve`;
      else if (type === 'payslip') url = `/api/payroll/payslips/${id}/approve`;

      await axios.post(url);
      showSnackbar(`Successfully approved ${type}.`);
      fetchData();
    } catch (err) {
      showSnackbar(`Failed to approve ${type}: ${err.response?.data?.msg}`, 'error');
    }
  };

  const openRejectionDialog = (id, handler, type) => {
    setRejectionInfo({ id, handler, type });
    setRejectionDialogOpen(true);
  };

  const handleCloseRejectionDialog = () => {
    setRejectionDialogOpen(false);
    setRejectionReason('');
    setRejectionInfo({ id: null, handler: null, type: '' });
  };

  const handleConfirmRejection = () => {
    if (rejectionInfo.id && rejectionReason) {
      rejectionInfo.handler(rejectionInfo.id, rejectionReason, rejectionInfo.type);
    }
    handleCloseRejectionDialog();
  };

  const handleReject = async (id, reason, type) => {
    try {
      let url = '';
      if (type === 'onboarding') url = `/api/admin/applications/${id}/reject`;
      else if (type === 'od') url = `/api/onduty/${id}/reject`;
      else if (type === 'loan') url = `/api/loan/${id}/reject`;

      await axios.post(url, { reason });
      showSnackbar(`Successfully rejected ${type}.`);
      fetchData();
    } catch (err) {
      showSnackbar(`Failed to reject ${type}: ${err.response?.data?.msg}`, 'error');
    }
  };

  const handleRunPayroll = async () => {
      const today = new Date();
      try {
          await axios.post('/api/payroll/run', { year: today.getFullYear(), month: today.getMonth() + 1 });
          showSnackbar('Payroll run initiated successfully.');
          fetchData();
      } catch (err) { showSnackbar('Failed to run payroll: ' + err.response?.data?.msg, 'error'); }
  };

  const handleMainTabChange = (event, newValue) => { setMainTab(newValue); setSubTab(0); };
  const handleSubTabChange = (event, newValue) => { setSubTab(newValue); };

  // --- Render Methods ---
  const renderOnboardingTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Submitted</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>{applications.map((app) => (
            <TableRow key={app._id}>
              <TableCell>{app.personal.firstName} {app.personal.lastName}</TableCell>
              <TableCell>{app.contact.email}</TableCell>
              <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell>
                {(app.status === 'PendingAdmin' && user.role === 'Admin') || (app.status === 'PendingSuperAdmin' && user.role === 'SuperAdmin') ? (
                  <Box><Button onClick={() => handleApprove(app._id, 'onboarding')}>Approve</Button><Button color="error" onClick={() => openRejectionDialog(app._id, handleReject, 'onboarding')}>Reject</Button></Box>
                ) : <Typography color={app.status === 'Approved' ? 'green' : 'red'}>{app.status}</Typography>}
              </TableCell>
            </TableRow>
          ))}</TableBody>
      </Table>
    </TableContainer>
  );

  const renderOnDutyTable = () => (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Client</TableCell><TableCell>Date</TableCell><TableCell>Purpose</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>{onDutyLogs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.user?.name || 'N/A'}</TableCell><TableCell>{log.clientName}</TableCell><TableCell>{new Date(log.date).toLocaleDateString()}</TableCell><TableCell>{log.purpose}</TableCell><TableCell>{log.status}</TableCell>
                <TableCell>{log.status === 'Pending' && (<Box><Button onClick={() => handleApprove(log._id, 'od')}>Approve</Button><Button color="error" onClick={() => openRejectionDialog(log._id, handleReject, 'od')}>Reject</Button></Box>)}</TableCell>
              </TableRow>
            ))}</TableBody>
        </Table>
      </TableContainer>
  );

  const renderLoanTable = () => (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Amount</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>{loanRequests.map((req) => (
              <TableRow key={req._id}>
                <TableCell>{req.user?.name || 'N/A'}</TableCell><TableCell>${req.amount}</TableCell><TableCell>{req.reason}</TableCell><TableCell>{req.status}</TableCell>
                <TableCell>{req.status === 'Pending' && (<Box><Button onClick={() => handleApprove(req._id, 'loan')}>Approve</Button><Button color="error" onClick={() => openRejectionDialog(req._id, handleReject, 'loan')}>Reject</Button></Box>)}</TableCell>
              </TableRow>
            ))}</TableBody>
        </Table>
      </TableContainer>
  );

  const renderPayrollPanel = () => (
    <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleRunPayroll}>Run Payroll for Current Month</Button>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Net Salary</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                <TableBody>{payslips.map((p) => (
                        <TableRow key={p._id}>
                            <TableCell>{p.user.name}</TableCell><TableCell>${p.netSalary.toFixed(2)}</TableCell><TableCell>{p.status}</TableCell>
                            <TableCell>{p.status === 'PendingApproval' && <Button onClick={() => handleApprove(p._id, 'payslip')}>Approve</Button>}</TableCell>
                        </TableRow>
                    ))}</TableBody>
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
          <Tab label="Onboarding" /><Tab label="On-Duty Logs" /><Tab label="Loan Requests" />
          {(user?.role === 'HRAccounts' || user?.role === 'SuperAdmin') && <Tab label="Payroll" />}
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

      <Dialog open={rejectionDialogOpen} onClose={handleCloseRejectionDialog} fullWidth>
        <DialogTitle>Rejection Reason</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Reason" type="text" fullWidth variant="standard" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectionDialog}>Cancel</Button>
          <Button onClick={handleConfirmRejection} color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AdminDashboardPage;
