import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  mapView: 'satellite' | 'street' | 'hybrid';
  selectedIssueId: string | null;
  selectedDepartment: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  mapView: 'street',
  selectedIssueId: null,
  selectedDepartment: null,
  dateRange: {
    start: null,
    end: null,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    setMapView: (state, action: PayloadAction<'satellite' | 'street' | 'hybrid'>) => {
      state.mapView = action.payload;
    },
    setSelectedIssueId: (state, action: PayloadAction<string | null>) => {
      state.selectedIssueId = action.payload;
    },
    setSelectedDepartment: (state, action: PayloadAction<string | null>) => {
      state.selectedDepartment = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.dateRange = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  clearAllNotifications,
  setMapView,
  setSelectedIssueId,
  setSelectedDepartment,
  setDateRange,
} = uiSlice.actions;

export default uiSlice.reducer;
