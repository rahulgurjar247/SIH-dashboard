import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Grid,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  Business,
  People,
  TrendingUp,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import { useGetDepartmentsQuery } from '../../store/api/departmentsApi';

const DepartmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: departmentsData, isLoading, error, refetch } = useGetDepartmentsQuery({
    page,
    limit: pageSize,
    search: searchQuery,
  });

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Department',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <Business />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.description || 'No description'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'headOfDepartment',
      headerName: 'Head of Department',
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? (
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.75rem' }}>
              {params.value.name?.charAt(0)}
            </Avatar>
            <Typography variant="body2">
              {params.value.name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not assigned
          </Typography>
        )
      ),
    },
    {
      field: 'contactEmail',
      headerName: 'Contact',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2">
            {params.value || 'No email'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.contactPhone || 'No phone'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'stats',
      headerName: 'Issues',
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const stats = departmentsData?.data?.stats?.find(
          (stat: any) => stat._id === params.row._id
        );
        return (
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {stats?.totalIssues || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              total issues
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'resolutionRate',
      headerName: 'Resolution Rate',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const stats = departmentsData?.data?.stats?.find(
          (stat: any) => stat._id === params.row._id
        );
        const rate = stats?.resolutionRate || 0;
        return (
          <Box textAlign="center">
            <Typography 
              variant="h6" 
              fontWeight="bold"
              color={rate > 70 ? 'success.main' : rate > 40 ? 'warning.main' : 'error.main'}
            >
              {rate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              resolved
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load departments
        </Alert>
        <Button onClick={() => refetch()} variant="contained">
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Department Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage departments and their assignments
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* Navigate to create department */}}
          >
            New Department
          </Button>
          <IconButton onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {departmentsData?.data?.stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Business color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {departmentsData.data.stats.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Departments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <People color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {departmentsData.data.stats.reduce((sum: number, stat: any) => sum + stat.totalIssues, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Issues
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {departmentsData.data.stats.reduce((sum: number, stat: any) => sum + stat.resolvedIssues, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Issues
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" fontWeight="bold">
                  {departmentsData.data.stats.length > 0 
                    ? Math.round(
                        departmentsData.data.stats.reduce((sum: number, stat: any) => sum + stat.resolutionRate, 0) / 
                        departmentsData.data.stats.length
                      )
                    : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Resolution Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data Grid */}
      <Card>
        {isLoading && <LinearProgress />}
        <DataGrid
          rows={departmentsData?.data?.departments || []}
          columns={columns}
          loading={isLoading}
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50]}
          pagination
          autoHeight
          disableSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default DepartmentsPage;
