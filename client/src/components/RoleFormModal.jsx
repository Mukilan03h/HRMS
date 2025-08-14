import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
} from '@mui/material';

const RoleFormModal = ({ open, onClose, onSave, role, allPermissions }) => {
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());

  useEffect(() => {
    if (role) {
      // If editing, populate the form with existing role data
      setName(role.name);
      setSelectedPermissions(new Set(role.permissions.map(p => p._id)));
    } else {
      // If creating, reset the form
      setName('');
      setSelectedPermissions(new Set());
    }
  }, [role, open]); // Rerun when the role or open state changes

  const handlePermissionChange = (permissionId) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionId)) {
      newSelection.delete(permissionId);
    } else {
      newSelection.add(permissionId);
    }
    setSelectedPermissions(newSelection);
  };

  const handleSave = () => {
    const roleData = {
      name,
      permissions: Array.from(selectedPermissions),
    };
    onSave(roleData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Role Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Typography variant="h6" gutterBottom>Assign Permissions</Typography>
        <Grid container spacing={2}>
          {allPermissions.map((permission) => (
            <Grid item xs={12} sm={6} md={4} key={permission._id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPermissions.has(permission._id)}
                      onChange={() => handlePermissionChange(permission._id)}
                    />
                  }
                  label={permission.name}
                />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleFormModal;
