import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { hasPermission } = useContext(AuthContext);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axios.get('/api/superadmin/users'),
        axios.get('/api/superadmin/roles'),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. You may not have the required permissions.');
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (hasPermission('user:read')) {
      fetchData();
    }
  }, [hasPermission]);

  const handleRoleChange = async (userId, newRoleId) => {
    try {
        await axios.put(`/api/superadmin/users/${userId}/assign-role`, { roleId: newRoleId });
        // Optimistically update the UI or refetch data
        const updatedUsers = users.map(u =>
            u._id === userId ? { ...u, role: roles.find(r => r._id === newRoleId) } : u
        );
        setUsers(updatedUsers);
        alert('User role updated successfully.');
    } catch (err) {
        alert('Failed to update user role.');
        console.error(err);
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
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Current Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.personal?.firstName} {user.personal?.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {hasPermission('user:assign_role') ? (
                    <FormControl size="small">
                      <Select
                        value={user.role?._id || ''}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    user.role?.name || 'N/A'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default UserManagementPage;
