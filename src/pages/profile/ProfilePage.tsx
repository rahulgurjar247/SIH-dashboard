import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Edit,
  Save,
  CameraAlt,
  LocationOn,
  Email,
  Phone,
  Work,
  Security,
  Notifications,
  Language,
  Palette,
  Person,
} from '@mui/icons-material';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../store/api/authApi';

// Define interfaces for better type safety
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'department';
  department?: string;
  phone?: string;
  profileImage?: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileData {
  user: User;
  token: string;
  refreshToken: string;
}

interface UpdateProfileFormData {
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'user' | 'department';
  phone?: string;
  location?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  
  const [formData, setFormData] = useState<UpdateProfileFormData>({
    name: '',
    email: '',
    department: '',
    role: 'user',
    phone: '',
    location: '',
  });

  // Update form data when profile data loads
  useEffect(() => {
    if (profileData?.data?.user) {
      const user = profileData.data.user;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        role: user.role || 'user',
        phone: user.phone || '',
        location: user.location || '',
      });
    }
  }, [profileData]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveProfile = async () => {
    try {
      // Only send the fields that are allowed to be updated
      const updateData = {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        phone: formData.phone,
        location: formData.location,
      };
      await updateProfile(updateData).unwrap();
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
  
  if (isLoading) {
    return <Box sx={{ p: 3 }}>Loading profile...</Box>;
  }

  const user = profileData?.data?.user;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
        Profile Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ mb: 3, overflow: 'visible' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.profileImage || ''}
                  alt={user?.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    mb: 2,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: -10,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': { backgroundColor: theme.palette.primary.dark },
                  }}
                  size="small"
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user?.name}
              </Typography>
              
              <Chip
                label={user?.role}
                color="primary"
                size="small"
                sx={{ mb: 2, textTransform: 'capitalize' }}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Work fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.department || 'No department'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.location || 'No location set'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Phone fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {user?.phone || 'No phone number'}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                startIcon={editMode ? <Save /> : <Edit />}
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                fullWidth
                disabled={isUpdating}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </CardContent>
          </Card>
          
          <Card elevation={0}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Account Statistics
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Issues Reported</Typography>
                <Typography variant="body2" fontWeight="bold">24</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Issues Resolved</Typography>
                <Typography variant="body2" fontWeight="bold">18</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Account Created</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Last Login</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Today'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 2,
                },
              }}
            >
              <Tab label="Personal Information" icon={<Person />} iconPosition="start" />
              <Tab label="Security" icon={<Security />} iconPosition="start" />
              <Tab label="Preferences" icon={<Palette />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={editMode ? formData.name : user?.name || ''}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={editMode ? formData.email : user?.email || ''}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={editMode ? formData.phone : user?.phone || ''}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={editMode ? formData.department : user?.department || ''}
                      onChange={handleInputChange}
                      disabled={!editMode || user?.role !== 'admin'}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      name="role"
                      value={user?.role || ''}
                      disabled={true}
                      variant="outlined"
                      sx={{ mb: 3, textTransform: 'capitalize' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={editMode ? formData.location : user?.location || ''}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                </Grid>
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ensure your account is using a strong password to keep your account secure.
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                </Grid>
                
                <Button variant="contained" color="primary">
                  Update Password
                </Button>
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Application Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Customize your application experience.
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Theme
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Palette />}>
                      Light Mode
                    </Button>
                    <Button variant="outlined" startIcon={<Palette />}>
                      Dark Mode
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Notifications
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Notifications />}>
                      Enable All
                    </Button>
                    <Button variant="outlined" startIcon={<Notifications />}>
                      Disable All
                    </Button>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Language
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<Language />}>
                      English
                    </Button>
                    <Button variant="outlined" startIcon={<Language />}>
                      Hindi
                    </Button>
                  </Box>
                </Box>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;