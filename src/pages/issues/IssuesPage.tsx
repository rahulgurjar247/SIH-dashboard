import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Grid,
  Paper,
  Avatar,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewList,
  ViewModule,
  Refresh,
  Add,
  MoreVert,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useGetIssuesQuery } from '../../store/api/issuesApi';
import { updateFilters, resetFilters } from '../../store/slices/filtersSlice';

const CATEGORIES = ['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'];
const STATUSES = ['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved': return 'success';
    case 'in-progress': return 'info';
    case 'acknowledged': return 'warning';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'success';
    default: return 'default';
  }
};

const IssuesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');

  const { data: issuesData, isLoading, error, refetch } = useGetIssuesQuery(filters || {});

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value);
  const handleSearchSubmit = () => dispatch(updateFilters({ search: searchQuery }));
  const handleFilterChange = (filterType: string, value: any) => dispatch(updateFilters({ [filterType]: value }));
  const handleResetFilters = () => { dispatch(resetFilters()); setSearchQuery(''); };
  const handleViewModeChange = (_: any, newViewMode: 'grid' | 'list' | null) => { if (newViewMode) setViewMode(newViewMode); };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight="600" noWrap>{params.value}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{params.row.description?.substring(0, 50)}...</Typography>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 120,
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value} size="small" color="primary" variant="outlined" />,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value} size="small" color={getPriorityColor(params.value) as any} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value} size="small" color={getStatusColor(params.value) as any} />,
    },
    {
      field: 'reportedBy',
      headerName: 'Reported By',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 24, height: 24, mr: 1 }}>{params.value?.name?.charAt(0)}</Avatar>
          <Typography variant="body2" noWrap>{params.value?.name}</Typography>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={format(new Date(params.value), 'PPP')}>
          <Typography variant="body2">{format(new Date(params.value), 'MMM dd')}</Typography>
        </Tooltip>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: () => <IconButton size="small"><MoreVert /></IconButton>,
    },
  ];

  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" color="error" gutterBottom>Failed to load issues</Typography>
        <Button onClick={() => refetch()} variant="contained">Try Again</Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="700">Issues Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage and track civic issues effectively</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2, px: 2 }}>New Issue</Button>
          <IconButton color="primary" onClick={() => refetch()}><Refresh /></IconButton>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search issues..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                multiple
                value={filters?.category || []}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                input={<OutlinedInput label="Category" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                  </Box>
                )}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={(filters?.category || []).includes(category)} />
                    <ListItemText primary={category} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={filters?.status || []}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                  </Box>
                )}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={(filters?.status || []).includes(status)} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                multiple
                value={filters?.priority || []}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                input={<OutlinedInput label="Priority" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                  </Box>
                )}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    <Checkbox checked={(filters?.priority || []).includes(priority)} />
                    <ListItemText primary={priority} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box display="flex" gap={1}>
              <Button variant="outlined" startIcon={<FilterList />} onClick={(e) => setFilterAnchorEl(e.currentTarget)}>More</Button>
              <Button variant="outlined" onClick={handleResetFilters}>Reset</Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* View Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">{issuesData?.pagination.totalItems || 0} issues found</Typography>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
          <ToggleButton value="grid"><ViewModule /></ToggleButton>
          <ToggleButton value="list"><ViewList /></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Data Grid */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <DataGrid
          rows={issuesData?.data || []}
          columns={columns}
          loading={isLoading}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 20 } } }}
          pageSizeOptions={[10, 20, 50]}
          pagination
          autoHeight
          disableRowSelectionOnClick
          getRowId={(row) => row._id}
          sx={{ border: 0, '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
        />
      </Card>

      {/* More Filters Menu */}
      <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)}>
        <MenuItem>
          <DatePicker
            label="Start Date"
            value={filters?.dateRange?.start ? new Date(filters.dateRange.start) : null}
            onChange={(date) => handleFilterChange('dateRange', { ...(filters?.dateRange || {}), start: date ? date.toISOString() : null })}
            slotProps={{ textField: { size: 'small' } }}
          />
        </MenuItem>
        <MenuItem>
          <DatePicker
            label="End Date"
            value={filters?.dateRange?.end ? new Date(filters.dateRange.end) : null}
            onChange={(date) => handleFilterChange('dateRange', { ...(filters?.dateRange || {}), end: date ? date.toISOString() : null })}
            slotProps={{ textField: { size: 'small' } }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default IssuesPage;
