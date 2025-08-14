import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

// A static list of available widgets. In a more advanced system, this could also come from an API.
const AVAILABLE_WIDGETS = [
  { id: 'attendance_summary', name: 'Attendance Summary' },
  { id: 'pending_loans', name: 'Pending Loan Requests' },
  { id: 'on_duty_roster', name: 'On-Duty Roster' },
  { id: 'team_view', name: 'My Team View' },
  { id: 'payslip_viewer', name: 'My Payslips' },
];

function DashboardLayoutPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [currentLayout, setCurrentLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { hasPermission } = useContext(AuthContext);

  useEffect(() => {
    if (hasPermission('layout:manage')) {
      axios.get('/api/superadmin/roles')
        .then(res => setRoles(res.data))
        .catch(err => console.error('Failed to fetch roles', err));
    }
  }, [hasPermission]);

  useEffect(() => {
    if (selectedRole) {
      setIsLoading(true);
      axios.get(`/api/superadmin/layouts/${selectedRole}`)
        .then(res => {
          setCurrentLayout(res.data.layout.widgets || []);
        })
        .catch(err => console.error('Failed to fetch layout', err))
        .finally(() => setIsLoading(false));
    }
  }, [selectedRole]);

  const handleWidgetToggle = (widgetId) => {
    const newLayout = [...currentLayout];
    const index = newLayout.indexOf(widgetId);
    if (index === -1) {
      newLayout.push(widgetId);
    } else {
      newLayout.splice(index, 1);
    }
    setCurrentLayout(newLayout);
  };

  const handleSaveLayout = () => {
    if (!selectedRole) {
      alert('Please select a role first.');
      return;
    }
    const newLayoutData = { layout: { widgets: currentLayout } };
    axios.put(`/api/superadmin/layouts/${selectedRole}`, newLayoutData)
      .then(() => alert('Layout saved successfully!'))
      .catch(err => alert('Failed to save layout.'));
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Layout Management
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="role-select-label">Select Role to Configure</InputLabel>
        <Select
          labelId="role-select-label"
          value={selectedRole}
          label="Select Role to Configure"
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map((role) => (
            <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRole && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">Configure Widgets</Typography>
          <FormGroup>
            {AVAILABLE_WIDGETS.map((widget) => (
              <FormControlLabel
                key={widget.id}
                control={
                  <Checkbox
                    checked={currentLayout.includes(widget.id)}
                    onChange={() => handleWidgetToggle(widget.id)}
                  />
                }
                label={widget.name}
              />
            ))}
          </FormGroup>
          <Button variant="contained" onClick={handleSaveLayout} sx={{ mt: 2 }}>
            Save Layout
          </Button>
        </Paper>
      )}
    </Container>
  );
}

export default DashboardLayoutPage;
