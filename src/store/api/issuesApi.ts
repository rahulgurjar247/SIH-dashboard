import { baseApi } from './baseApi';

export interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'in-progress' | 'resolved' | 'rejected';
  longitude: number;
  latitude: number;
  address?: string;
  images: Array<{
    url: string;
    publicId: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
    uploadedAt: string;
  }>;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  department?: string;
  upvotes: string[];
  downvotes: string[];
  tags: string[];
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdated: string;
}

export interface IssuesResponse {
  success: boolean;
  data: Issue[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IssueResponse {
  success: boolean;
  data: Issue;
  message?: string;
}

export interface IssueUpdateItem {
  note?: string;
  images?: Array<{
    url: string;
    publicId?: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
    uploadedAt?: string;
  }>;
  status?: Issue['status'];
  createdBy: { _id: string; name: string; email?: string };
  createdAt: string;
}

export interface IssueUpdatesResponse {
  success: boolean;
  data: IssueUpdateItem[];
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: string;
  priority?: string;
  coordinates: [number, number];
  address?: string;
  tags?: string;
  images?: File[];
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  department?: string;
  tags?: string[];
}

export interface VoteRequest {
  voteType: 'upvote' | 'downvote';
}

export interface VoteResponse {
  success: boolean;
  data: {
    upvotes: number;
    downvotes: number;
    voteCount: number;
  };
  message: string;
}

export interface NearbyIssuesRequest {
  longitude: number;
  latitude: number;
  radius?: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    totalIssues: number;
    resolvedIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    rejectedIssues: number;
    issuesByCategory: Array<{ category: string; count: number }>;
    issuesByPriority: Array<{ priority: string; count: number }>;
    issuesByStatus: Array<{ status: string; count: number }>;
    issuesByDepartment: Array<{ department: string; count: number }>;
    issuesByMonth: Array<{ month: string; count: number }>;
    averageResolutionTime: number;
    topReporters: Array<{ user: string; count: number }>;
    topDepartments: Array<{ department: string; count: number; resolved: number }>;
  };
}

export const issuesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIssues: builder.query<IssuesResponse, any>({
      query: (params) => ({
        url: '/issues',
        params,
      }),
      providesTags: ['Issue'],
    }),
    getIssueById: builder.query<IssueResponse, string>({
      query: (id) => `/issues/${id}`,
      providesTags: (result, error, id) => [{ type: 'Issue', id }],
    }),
    createIssue: builder.mutation<IssueResponse, FormData>({
      query: (formData) => ({
        url: '/issues/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Issue'],
    }),
    updateIssue: builder.mutation<IssueResponse, { id: string; data: UpdateIssueRequest }>({
      query: ({ id, data }) => ({
        url: `/issues/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Issue', id }, 'Issue'],
    }),
    deleteIssue: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/issues/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Issue'],
    }),
    voteIssue: builder.mutation<VoteResponse, { id: string; voteData: VoteRequest }>({
      query: ({ id, voteData }) => ({
        url: `/issues/${id}/vote`,
        method: 'POST',
        body: voteData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Issue', id }, 'Issue'],
    }),
    getNearbyIssues: builder.query<IssuesResponse, NearbyIssuesRequest>({
      query: (params) => ({
        url: '/issues/nearby',
        params,
      }),
      providesTags: ['Issue'],
    }),
    getAnalytics: builder.query<AnalyticsResponse, any>({
      query: (params) => ({
        url: '/analytics/dashboard',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    assignIssue: builder.mutation<IssueResponse, { id: string; assignedTo: string; department?: string }>({
      query: ({ id, assignedTo, department }) => ({
        url: `/issues/${id}/assign`,
        method: 'POST',
        body: { assignedTo, department },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Issue', id }, 'Issue'],
    }),
    updateIssueStatus: builder.mutation<IssueResponse, { id: string; status: string; notes?: string }>({
      query: ({ id, status, notes }) => ({
        url: `/issues/${id}/status`,
        method: 'POST',
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Issue', id }, 'Issue'],
    }),
    getIssueUpdates: builder.query<IssueUpdatesResponse, string>({
      query: (id) => `/issues/${id}/updates`,
      providesTags: (result, error, id) => [{ type: 'Issue', id }],
    }),
    addIssueUpdate: builder.mutation<IssueResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/issues/${id}/updates`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Issue', id }, 'Issue'],
    }),
  }),
});

export const {
  useGetIssuesQuery,
  useGetIssueByIdQuery,
  useCreateIssueMutation,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useVoteIssueMutation,
  useGetNearbyIssuesQuery,
  useGetAnalyticsQuery,
  useAssignIssueMutation,
  useUpdateIssueStatusMutation,
  useGetIssueUpdatesQuery,
  useAddIssueUpdateMutation,
} = issuesApi;
