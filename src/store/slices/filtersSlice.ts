import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IssueFilters {
  search: string;
  category: string[];
  status: string[];
  priority: string[];
  department: string[];
  assignedTo: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  location: {
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    } | null;
    center: {
      lat: number;
      lng: number;
    } | null;
    radius: number;
  };
  sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

const initialState: IssueFilters = {
  search: '',
  category: [],
  status: [],
  priority: [],
  department: [],
  assignedTo: [],
  dateRange: {
    start: null,
    end: null,
  },
  location: {
    bounds: null,
    center: null,
    radius: 10,
  },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 1; // Reset to first page when searching
    },
    setCategory: (state, action: PayloadAction<string[]>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setStatus: (state, action: PayloadAction<string[]>) => {
      state.status = action.payload;
      state.page = 1;
    },
    setPriority: (state, action: PayloadAction<string[]>) => {
      state.priority = action.payload;
      state.page = 1;
    },
    setDepartment: (state, action: PayloadAction<string[]>) => {
      state.department = action.payload;
      state.page = 1;
    },
    setAssignedTo: (state, action: PayloadAction<string[]>) => {
      state.assignedTo = action.payload;
      state.page = 1;
    },
    setDateRange: (state, action: PayloadAction<{ start: string | null; end: string | null }>) => {
      state.dateRange = action.payload;
      state.page = 1;
    },
    setLocation: (state, action: PayloadAction<{
      bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
      } | null;
      center?: {
        lat: number;
        lng: number;
      } | null;
      radius?: number;
    }>) => {
      if (action.payload.bounds !== undefined) {
        state.location.bounds = action.payload.bounds;
      }
      if (action.payload.center !== undefined) {
        state.location.center = action.payload.center;
      }
      if (action.payload.radius !== undefined) {
        state.location.radius = action.payload.radius;
      }
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy as any;
      state.sortOrder = action.payload.sortOrder;
      state.page = 1;
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit?: number }>) => {
      state.page = action.payload.page;
      if (action.payload.limit) {
        state.limit = action.payload.limit;
      }
    },
    resetFilters: (state) => {
      return { ...initialState };
    },
    updateFilters: (state, action: PayloadAction<Partial<IssueFilters>>) => {
      return { ...state, ...action.payload, page: 1 };
    },
  },
});

export const {
  setSearch,
  setCategory,
  setStatus,
  setPriority,
  setDepartment,
  setAssignedTo,
  setDateRange,
  setLocation,
  setSorting,
  setPagination,
  resetFilters,
  updateFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
