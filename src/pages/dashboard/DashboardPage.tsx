import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BugReport,
  CheckCircle,
  Schedule,
  Cancel,
  TrendingUp,
  TrendingDown,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import { useAppSelector } from '../../hooks/redux';
import { useGetAnalyticsQuery } from '../../store/api/issuesApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard: React.FC<{
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.3)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Typography 
            color="textSecondary" 
            gutterBottom 
            variant="subtitle2"
            fontWeight="500"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            component="div" 
            fontWeight="700"
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}88 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value.toLocaleString()}
          </Typography>
          <Box display="flex" alignItems="center" mt={2}>
            {change >= 0 ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={change >= 0 ? 'success.main' : 'error.main'}
              sx={{ ml: 0.5, fontWeight: 600 }}
            >
              {Math.abs(change)}% from last month
            </Typography>
          </Box>
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: color, 
            width: 64, 
            height: 64,
            boxShadow: `0 8px 32px ${color}40`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
              animation: 'shimmer 2s infinite',
            },
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: analyticsData, isLoading, error, refetch } = useGetAnalyticsQuery({});

  if (isLoading) {
    return (
      <Box>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load dashboard data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try refreshing the page
        </Typography>
      </Box>
    );
  }

  const analytics = analyticsData?.data;

  if (!analytics) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  // Prepare chart data with null checks
  const issuesByMonth = (analytics.issuesByMonth || []).map(item => ({
    month: item.month,
    count: item.count,
  }));

  const issuesByCategory = (analytics.issuesByCategory || []).map(item => ({
    name: item.category,
    value: item.count,
  }));

  const issuesByStatus = (analytics.issuesByStatus || []).map(item => ({
    name: item.status,
    value: item.count,
  }));

  const topDepartments = (analytics.topDepartments || []).slice(0, 5).map(item => ({
    department: item.department,
    total: item.count,
    resolved: item.resolved,
  }));

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with civic issues today
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => refetch()} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter Data">
            <IconButton color="primary">
              <FilterList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Issues"
            value={analytics.totalIssues || 0}
            change={12}
            icon={<BugReport />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Resolved"
            value={analytics.resolvedIssues || 0}
            change={8}
            icon={<CheckCircle />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={analytics.inProgressIssues || 0}
            change={-5}
            icon={<Schedule />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={analytics.pendingIssues || 0}
            change={15}
            icon={<Cancel />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Issues Over Time */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={issuesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Issues by Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={issuesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issuesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Issues by Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issues by Category
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={issuesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Departments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Department Performance
              </Typography>
              <List>
                {topDepartments.map((dept, index) => (
                  <React.Fragment key={dept.department}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={dept.department}
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2">
                              {dept.total} total issues
                            </Typography>
                            <Chip
                              label={`${Math.round((dept.resolved / dept.total) * 100)}% resolved`}
                              size="small"
                              color={dept.resolved / dept.total > 0.7 ? 'success' : 'warning'}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < topDepartments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Average Resolution Time
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {analytics.averageResolutionTime || 0} days
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="success" gutterBottom>
              Resolution Rate
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {analytics.totalIssues > 0 ? Math.round((analytics.resolvedIssues / analytics.totalIssues) * 100) : 0}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="info" gutterBottom>
              Active Users
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {analytics.topReporters?.length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
