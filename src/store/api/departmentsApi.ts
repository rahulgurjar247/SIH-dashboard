import { baseApi } from './baseApi';

export interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  issueCount?: number;
  resolvedIssueCount?: number;
  pendingIssueCount?: number;
}

export interface DepartmentStats {
  _id: string;
  name: string;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  resolutionRate: number;
}

export interface DepartmentsResponse {
  success: boolean;
  data: {
    departments: Department[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats: DepartmentStats[];
  };
  message?: string;
}

export interface DepartmentResponse {
  success: boolean;
  data: {
    department: Department;
    stats?: DepartmentStats;
  };
  message?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
}

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<DepartmentsResponse, any>({
      query: (params) => ({
        url: '/departments',
        params,
      }),
      providesTags: ['Department'],
    }),
    getDepartmentById: builder.query<DepartmentResponse, string>({
      query: (id) => `/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Department', id }],
    }),
    createDepartment: builder.mutation<DepartmentResponse, CreateDepartmentRequest>({
      query: (departmentData) => ({
        url: '/departments',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation<DepartmentResponse, { id: string; data: UpdateDepartmentRequest }>({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Department', id }, 'Department'],
    }),
    deleteDepartment: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    getDepartmentStats: builder.query<{
      success: boolean;
      data: {
        stats: DepartmentStats[];
      };
      message: string;
    }, void>({
      query: () => '/departments/stats',
      providesTags: ['Department'],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentStatsQuery,
} = departmentsApi;
