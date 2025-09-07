import { baseApi } from './baseApi';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'department' | 'user';
  department?: string;
  profileImage?: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  phone?: string;
  address?: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'department' | 'user';
  department?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'department' | 'user';
  department?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  headOfDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data: Department[];
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, any>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<UserResponse, CreateUserRequest>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<UserResponse, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getDepartments: builder.query<DepartmentsResponse, void>({
      query: () => '/departments',
      providesTags: ['Department'],
    }),
    createDepartment: builder.mutation<{ success: boolean; data: Department; message: string }, Omit<Department, '_id' | 'createdAt' | 'updatedAt'>>({
      query: (departmentData) => ({
        url: '/departments',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation<{ success: boolean; data: Department; message: string }, { id: string; data: Partial<Department> }>({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Department'],
    }),
    deleteDepartment: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Department'],
    }),
    getUserStats: builder.query<{
      success: boolean;
      data: {
        totalUsers: number;
        activeUsers: number;
        usersByRole: Array<{ role: string; count: number }>;
        usersByDepartment: Array<{ department: string; count: number }>;
        recentUsers: User[];
        topReporters: Array<{ user: string; count: number }>;
      };
    }, any>({
      query: (params) => ({
        url: '/users/stats',
        params,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetUserStatsQuery,
} = usersApi;
