import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../context/AuthContext';
import RoleFormModal from '../components/RoleFormModal';

function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, hasPermission } = useContext(AuthContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const fetchRolesAndPermissions = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        axios.get('/api/superadmin/roles'),
        axios.get('/api/superadmin/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. You may not have the required permissions.');
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasPermission('role:manage')) {
       fetchRolesAndPermissions();
    }
  }, [user]);

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole) {
        // Update existing role
        await axios.put(`/api/superadmin/roles/${editingRole._id}`, roleData);
      } else {
        // Create new role
        await axios.post('/api/superadmin/roles', roleData);
      }
      handleCloseModal();
      fetchRolesAndPermissions(); // Refresh data
    } catch (err) {
      alert(`Error saving role: ${err.response?.data?.msg || err.message}`);
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? This cannot be undone.')) {
        try {
            await axios.delete(`/api/superadmin/roles/${roleId}`);
            // Refetch roles to update the list
            fetchRolesAndPermissions();
        } catch (err) {
            alert('Failed to delete role. It might be assigned to users.');
            console.error(err);
        }
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Role Management
        </Typography>
        <Button variant="contained" onClick={handleCreateRole}>
          Create New Role
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.permissions.length} permissions</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEditRole(role)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteRole(role._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <RoleFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        role={editingRole}
        allPermissions={permissions}
      />
    </Container>
  );
}

export default RoleManagementPage;
