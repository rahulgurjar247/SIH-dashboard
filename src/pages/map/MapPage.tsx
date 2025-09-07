import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  MyLocation,
  Layers,
  FilterList,
  Refresh,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  BugReport,
  CheckCircle,
  Schedule,
  Cancel,
  Search,
  LocationOn,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useGetIssuesQuery } from '../../store/api/issuesApi';
import { useGetLocationHierarchyQuery, useGetLocationContainingPointQuery } from '../../store/api/locationsApi';
import { updateFilters } from '../../store/slices/filtersSlice';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved': return '🟢';
    case 'in-progress': return '🟡';
    case 'acknowledged': return '🟠';
    case 'rejected': return '🔴';
    default: return '⚪';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved': return '#4caf50';
    case 'in-progress': return '#ff9800';
    case 'acknowledged': return '#2196f3';
    case 'rejected': return '#f44336';
    default: return '#9e9e9e';
  }
};

const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  radius: number;
  userLocation: [number, number] | null;
  onUserLocated: (coords: [number, number]) => void;
}> = ({ center, zoom, radius, userLocation, onUserLocated }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos: [number, number] = [latitude, longitude];
          onUserLocated(userPos);
          map.setView(userPos, 15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Tooltip title="My Location" placement="left">
        <Fab color="primary" size="small" onClick={handleLocateUser}>
          <MyLocation />
        </Fab>
      </Tooltip>
      <Tooltip title="Zoom In" placement="left">
        <Fab color="default" size="small" onClick={() => map.zoomIn()}>
          <ZoomIn />
        </Fab>
      </Tooltip>
      <Tooltip title="Zoom Out" placement="left">
        <Fab color="default" size="small" onClick={() => map.zoomOut()}>
          <ZoomOut />
        </Fab>
      </Tooltip>
      {userLocation && (
        <Circle
          center={userLocation}
          radius={radius * 1000} // Convert km to meters
          pathOptions={{ color: '#1976d2', fillOpacity: 0.1 }}
        />
      )}
    </Box>
  );
};

// In-map search control wired to the same search logic
const SearchControl = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const map = useMap();

  useEffect(() => {
    const SearchCtl = (L.Control as any).extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        div.style.backgroundColor = 'white';
        div.style.padding = '6px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';

        const input = L.DomUtil.create('input', 'search-input') as HTMLInputElement;
        input.type = 'text';
        input.placeholder = 'Search locations...';
        input.style.width = '220px';
        input.style.height = '34px';
        input.style.border = '1px solid #e0e0e0';
        input.style.borderRadius = '6px';
        input.style.padding = '0 8px';
        input.style.outline = 'none';

        const button = L.DomUtil.create('button', 'search-button') as HTMLButtonElement;
        button.innerHTML = '🔍';
        button.style.marginLeft = '6px';
        button.style.height = '34px';
        button.style.width = '34px';
        button.style.border = '1px solid #e0e0e0';
        button.style.borderRadius = '6px';
        button.style.cursor = 'pointer';
        button.style.background = '#fff';

        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.disableScrollPropagation(div);
        
        button.onclick = () => {
          onSearch(input.value);
        };
        
        input.onkeypress = (e: any) => {
          if (e.key === 'Enter') {
            onSearch(input.value);
          }
        };
        
        div.appendChild(input);
        div.appendChild(button);
        
        return div as any;
      },
      options: { position: 'topleft' }
    });

    const searchControl = new (SearchCtl as any)();
    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSearch]);

  return null;
};

const MapPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state: any) => state.filters);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]); // Delhi coordinates
  const [mapZoom, setMapZoom] = useState(10);
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Get ALL issues, not just nearby ones
  const { data: issuesData, isLoading, refetch } = useGetIssuesQuery({
    ...filters,
    limit: 1000, // Get more issues for map view
  });

  const categories = ['road', 'water', 'electricity', 'garbage', 'drainage', 'park', 'traffic', 'other'];
  const statuses = ['pending', 'acknowledged', 'in-progress', 'resolved', 'rejected'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  // Fetch locations from API
  const { data: statesData } = useGetLocationHierarchyQuery({});
  const { data: districtsData } = useGetLocationHierarchyQuery({ stateId: selectedState });
  const { data: tehsilsData } = useGetLocationHierarchyQuery({ districtId: selectedDistrict });

  const states = statesData?.data?.states || [];
  const districts = districtsData?.data?.districts || [];
  const tehsils = tehsilsData?.data?.tehsils || [];

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategory.includes(category)
      ? selectedCategory.filter(c => c !== category)
      : [...selectedCategory, category];
    setSelectedCategory(newCategories);
    dispatch(updateFilters({ category: newCategories }));
  };

  const handleStatusChange = (status: string) => {
    const newStatuses = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(newStatuses);
    dispatch(updateFilters({ status: newStatuses }));
  };

  const handlePriorityChange = (priority: string) => {
    const newPriorities = selectedPriority.includes(priority)
      ? selectedPriority.filter(p => p !== priority)
      : [...selectedPriority, priority];
    setSelectedPriority(newPriorities);
    dispatch(updateFilters({ priority: newPriorities }));
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedDistrict('');
    setSelectedArea('all');
    
    const state = states.find(s => s._id === stateId);
    if (state) {
      setMapCenter(state.centerArray!);
      setMapZoom(state.zoomLevel);
    }
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrict(districtId);
    setSelectedArea('all');
    
    const district = districts.find(d => d._id === districtId);
    if (district) {
      setMapCenter(district.centerArray!);
      setMapZoom(district.zoomLevel);
    }
  };

  const handleTehsilChange = (tehsilId: string) => {
    setSelectedArea(tehsilId);
    
    const tehsil = tehsils.find(t => t._id === tehsilId);
    if (tehsil) {
      setMapCenter(tehsil.centerArray!);
      setMapZoom(tehsil.zoomLevel);
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Search in all locations (states, districts, tehsils)
    const allLocations = [...states, ...districts, ...tehsils];
    const results = allLocations.filter(location => 
      location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
    setShowSearchResults(true);

    // If found, center map on first result
    if (results.length > 0) {
      const firstResult = results[0];
      setMapCenter(firstResult.centerArray!);
      setMapZoom(firstResult.zoomLevel);
    } else {
      // If no results found, try to search for issues with similar location names
      const issueResults = filteredIssues.filter(issue => 
        issue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (issueResults.length > 0) {
        setSearchResults(issueResults.map(issue => ({
          name: issue.title,
          type: 'issue',
          centerArray: [issue.latitude, issue.longitude],
          zoomLevel: 15
        })));
        setShowSearchResults(true);
        
        // Center on first issue
        const firstIssue = issueResults[0];
        setMapCenter([firstIssue.latitude, firstIssue.longitude]);
        setMapZoom(15);
      }
    }
  };

  const handleSearchResultClick = (location: any) => {
    setMapCenter(location.centerArray!);
    setMapZoom(location.zoomLevel);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Cluster issues at same coordinates
  const clusterIssues = (issues: any[]) => {
    const clusters = new Map();
    
    issues.forEach(issue => {
      const key = `${issue.latitude.toFixed(6)},${issue.longitude.toFixed(6)}`;
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key).push(issue);
    });

    return Array.from(clusters.entries()).map(([coordinates, issues]) => ({
      coordinates,
      issues,
      latitude: issues[0].latitude,
      longitude: issues[0].longitude,
      count: issues.length
    }));
  };

  const handleRadiusChange = (event: Event, newValue: number | number[]) => {
    const newRadius = newValue as number;
    setRadius(newRadius);
    dispatch(updateFilters({ location: { ...filters.location, radius: newRadius } }));
  };

  const toRad = (value: number) => (value * Math.PI) / 180;
  const haversineDistanceKm = (a: [number, number], b: [number, number]) => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(b[0] - a[0]);
    const dLon = toRad(b[1] - a[1]);
    const lat1 = toRad(a[0]);
    const lat2 = toRad(b[0]);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aHarv = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
    return R * c;
  };

  const filteredIssues = issuesData?.data?.filter(issue => {
    const categoryMatch = selectedCategory.length === 0 || selectedCategory.includes(issue.category);
    const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(issue.status);
    const priorityMatch = selectedPriority.length === 0 || selectedPriority.includes(issue.priority);
    
    // Location-based filtering
    let locationMatch = true;
    
    if (selectedArea !== 'all') {
      // Check if issue is within selected tehsil
      const tehsil = tehsils.find(t => t._id === selectedArea);
      if (tehsil && tehsil.formattedBounds) {
        const [south, west] = tehsil.formattedBounds[0];
        const [north, east] = tehsil.formattedBounds[1];
        locationMatch = issue.latitude >= south && issue.latitude <= north && 
                       issue.longitude >= west && issue.longitude <= east;
      }
    } else if (selectedDistrict) {
      // Check if issue is within selected district
      const district = districts.find(d => d._id === selectedDistrict);
      if (district && district.formattedBounds) {
        const [south, west] = district.formattedBounds[0];
        const [north, east] = district.formattedBounds[1];
        locationMatch = issue.latitude >= south && issue.latitude <= north && 
                       issue.longitude >= west && issue.longitude <= east;
      }
    } else if (selectedState) {
      // Check if issue is within selected state
      const state = states.find(s => s._id === selectedState);
      if (state && state.formattedBounds) {
        const [south, west] = state.formattedBounds[0];
        const [north, east] = state.formattedBounds[1];
        locationMatch = issue.latitude >= south && issue.latitude <= north && 
                       issue.longitude >= west && issue.longitude <= east;
      }
    }

    // If user location is available, further filter by radius
    if (userLocation) {
      const distance = haversineDistanceKm(userLocation, [issue.latitude, issue.longitude]);
      locationMatch = locationMatch && distance <= radius;
    }
    
    return categoryMatch && statusMatch && priorityMatch && locationMatch;
  }) || [];

  // Cluster the filtered issues
  const clusteredIssues = clusterIssues(filteredIssues);

  const getIssueStats = () => {
    const stats = {
      total: filteredIssues.length,
      resolved: filteredIssues.filter(i => i.status === 'resolved').length,
      inProgress: filteredIssues.filter(i => i.status === 'in-progress').length,
      pending: filteredIssues.filter(i => i.status === 'pending').length,
    };
    return stats;
  };

  const stats = getIssueStats();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Map View
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize issues on the map
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
          >
            <ToggleButton value="map">Map</ToggleButton>
            <ToggleButton value="list">List</ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Search moved inside the map (in-map control). Keeping any result chips out for now */}

      {/* Stats Cards */}
      <Box display="flex" gap={2} mb={3}>
        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography variant="h6" color="primary">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Issues
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography variant="h6" color="success.main">
              {stats.resolved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography variant="h6" color="warning.main">
              {stats.inProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 120 }}>
          <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography variant="h6" color="error.main">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box display="flex" gap={3}>
        {/* Filters Sidebar */}
        <Card sx={{ width: 300, height: 'fit-content' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Select Location
            </Typography>
            
            {/* State Selection */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>State</InputLabel>
              <Select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                label="State"
              >
                <MenuItem value="">
                  <em>All States</em>
                </MenuItem>
                {states.map((state) => (
                  <MenuItem key={state._id} value={state._id}>
                    {state.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* District Selection */}
            {selectedState && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>District</InputLabel>
                <Select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  label="District"
                >
                  <MenuItem value="">
                    <em>All Districts</em>
                  </MenuItem>
                  {districts.map((district) => (
                    <MenuItem key={district._id} value={district._id}>
                      {district.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Tehsil Selection */}
            {selectedDistrict && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Tehsil</InputLabel>
                <Select
                  value={selectedArea}
                  onChange={(e) => handleTehsilChange(e.target.value)}
                  label="Tehsil"
                >
                  <MenuItem value="all">
                    <em>All Tehsils</em>
                  </MenuItem>
                  {tehsils.map((tehsil) => (
                    <MenuItem key={tehsil._id} value={tehsil._id}>
                      {tehsil.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Categories
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  color={selectedCategory.includes(category) ? 'primary' : 'default'}
                  onClick={() => handleCategoryChange(category)}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  size="small"
                  color={selectedStatus.includes(status) ? 'primary' : 'default'}
                  onClick={() => handleStatusChange(status)}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Priority
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {priorities.map((priority) => (
                <Chip
                  key={priority}
                  label={priority}
                  size="small"
                  color={selectedPriority.includes(priority) ? 'primary' : 'default'}
                  onClick={() => handlePriorityChange(priority)}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Search Radius: {radius} km
            </Typography>
            <Slider
              value={radius}
              onChange={handleRadiusChange}
              min={1}
              max={50}
              step={1}
              marks={[
                { value: 1, label: '1km' },
                { value: 10, label: '10km' },
                { value: 25, label: '25km' },
                { value: 50, label: '50km' },
              ]}
              sx={{ mb: 2 }}
            />

            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => {
                setSelectedCategory([]);
                setSelectedStatus([]);
                setSelectedPriority([]);
                setSelectedArea('all');
                setSelectedState('');
                setSelectedDistrict('');
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
                dispatch(updateFilters({ 
                  category: [], 
                  status: [], 
                  priority: [] 
                }));
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>

        {/* Map or List View */}
        <Box flex={1}>
          {viewMode === 'map' ? (
            <Card sx={{ height: 700 }}>
              <Box sx={{ height: '100%', position: 'relative' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapController 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    radius={radius}
                    userLocation={userLocation}
                    onUserLocated={(pos) => setUserLocation(pos)}
                  />
                  
                  {/* Show location boundary if selected */}
                  {(selectedArea !== 'all' || selectedDistrict || selectedState) && (
                    <>
                      {/* Show tehsil boundary */}
                      {selectedArea !== 'all' && tehsils.find(t => t._id === selectedArea)?.formattedBounds && (
                        <Rectangle
                          bounds={tehsils.find(t => t._id === selectedArea)!.formattedBounds!}
                          pathOptions={{
                            color: '#1976d2',
                            weight: 3,
                            fillColor: '#1976d2',
                            fillOpacity: 0.1
                          }}
                        />
                      )}
                      {/* Show district boundary */}
                      {selectedArea === 'all' && selectedDistrict && districts.find(d => d._id === selectedDistrict)?.formattedBounds && (
                        <Rectangle
                          bounds={districts.find(d => d._id === selectedDistrict)!.formattedBounds!}
                          pathOptions={{
                            color: '#ff9800',
                            weight: 3,
                            fillColor: '#ff9800',
                            fillOpacity: 0.1
                          }}
                        />
                      )}
                      {/* Show state boundary */}
                      {selectedArea === 'all' && !selectedDistrict && selectedState && states.find(s => s._id === selectedState)?.formattedBounds && (
                        <Rectangle
                          bounds={states.find(s => s._id === selectedState)!.formattedBounds!}
                          pathOptions={{
                            color: '#4caf50',
                            weight: 3,
                            fillColor: '#4caf50',
                            fillOpacity: 0.1
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  {clusteredIssues.map((cluster, clusterIndex) => (
                    <Marker
                      key={`cluster-${clusterIndex}`}
                      position={[cluster.latitude, cluster.longitude]}
                    >
                      <Popup maxWidth={400} maxHeight={500}>
                        <Box sx={{ minWidth: 300, maxWidth: 400 }}>
                          {cluster.count === 1 ? (
                            // Single issue
                            <>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                {cluster.issues[0].title}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {cluster.issues[0].description?.length > 100 
                                  ? `${cluster.issues[0].description.substring(0, 100)}...` 
                                  : cluster.issues[0].description}
                              </Typography>

                              {/* Issue Images */}
                              {cluster.issues[0].images && cluster.issues[0].images.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <img 
                                    src={cluster.issues[0].images[0].url} 
                                    alt="Issue" 
                                    style={{ 
                                      width: '100%', 
                                      height: '120px', 
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      marginBottom: '8px'
                                    }} 
                                  />
                                </Box>
                              )}

                              {/* Status, Category, Priority Chips */}
                              <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                <Chip
                                  label={cluster.issues[0].category}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={cluster.issues[0].status}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getStatusColor(cluster.issues[0].status),
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                                <Chip
                                  label={cluster.issues[0].priority}
                                  size="small"
                                  color={cluster.issues[0].priority === 'critical' ? 'error' : 
                                         cluster.issues[0].priority === 'high' ? 'warning' : 'default'}
                                />
                              </Box>

                              {/* Reporter Info */}
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" display="block" fontWeight="bold">
                                  Reported by: {cluster.issues[0].reportedBy.name}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  📧 {cluster.issues[0].reportedBy.email}
                                </Typography>
                              </Box>

                              {/* Location Info */}
                              <Box sx={{ mb: 1 }}>
                                <Typography variant="caption" display="block">
                                  📍 Coordinates: {cluster.issues[0].latitude.toFixed(4)}, {cluster.issues[0].longitude.toFixed(4)}
                                </Typography>
                                {cluster.issues[0].address && (
                                  <Typography variant="caption" display="block">
                                    📍 Address: {cluster.issues[0].address}
                                  </Typography>
                                )}
                              </Box>

                              {/* Action Button */}
                              <Button 
                                variant="contained" 
                                size="small" 
                                fullWidth 
                                sx={{ mt: 1 }}
                                onClick={() => {
                                  window.open(`/issues/${cluster.issues[0]._id}`, '_blank');
                                }}
                              >
                                View Details
                              </Button>
                            </>
                          ) : (
                            // Multiple issues at same location
                            <>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                📍 {cluster.count} Issues at Same Location
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Coordinates: {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}
                              </Typography>

                              <Divider sx={{ my: 1 }} />

                              {cluster.issues.map((issue: any, issueIndex: number) => (
                                <Box key={issue._id} sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {issueIndex + 1}. {issue.title}
                                  </Typography>
                                  
                                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                    {issue.description?.length > 80 
                                      ? `${issue.description.substring(0, 80)}...` 
                                      : issue.description}
                                  </Typography>

                                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                                    <Chip
                                      label={issue.category}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={issue.status}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: getStatusColor(issue.status),
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                    <Chip
                                      label={issue.priority}
                                      size="small"
                                      color={issue.priority === 'critical' ? 'error' : 
                                             issue.priority === 'high' ? 'warning' : 'default'}
                                    />
                                  </Box>

                                  <Typography variant="caption" display="block">
                                    👤 {issue.reportedBy.name} | 📅 {new Date(issue.createdAt).toLocaleDateString()}
                                  </Typography>

                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mt: 0.5 }}
                                    onClick={() => {
                                      window.open(`/issues/${issue._id}`, '_blank');
                                    }}
                                  >
                                    View Issue {issueIndex + 1}
                                  </Button>
                                  
                                  {issueIndex < cluster.issues.length - 1 && <Divider sx={{ mt: 1 }} />}
                                </Box>
                              ))}
                            </>
                          )}
                        </Box>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Issues List ({filteredIssues.length})
                </Typography>
                <List>
                  {filteredIssues.map((issue, index) => (
                    <React.Fragment key={issue._id}>
                      <ListItem>
                        <ListItemIcon>
                          <Typography fontSize="1.5rem">
                            {getStatusIcon(issue.status)}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={issue.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {issue.description}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Chip label={issue.category} size="small" />
                                <Chip label={issue.status} size="small" />
                                <Chip label={issue.priority} size="small" />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < filteredIssues.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MapPage;
