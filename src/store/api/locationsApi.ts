import { baseApi } from './baseApi';

export interface Location {
  _id: string;
  name: string;
  type: 'state' | 'district' | 'tehsil' | 'city' | 'village';
  parentId?: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  zoomLevel: number;
  level: number;
  stateCode?: string;
  districtCode?: string;
  population?: number;
  area?: number;
  formattedBounds?: [[number, number], [number, number]];
  centerArray?: [number, number];
}

export interface LocationHierarchy {
  states?: Location[];
  districts?: Location[];
  tehsils?: Location[];
}

export interface LocationsResponse {
  success: boolean;
  data: Location[];
  message: string;
}

export interface LocationHierarchyResponse {
  success: boolean;
  data: LocationHierarchy;
  message: string;
}

export interface LocationContainingResponse {
  success: boolean;
  data: Location[];
  message: string;
}

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLocationsByType: builder.query<LocationsResponse, { type: string; parentId?: string }>({
      query: ({ type, parentId }) => ({
        url: `/locations/type/${type}`,
        params: parentId ? { parentId } : undefined,
      }),
      providesTags: ['Location'],
    }),
    getLocationHierarchy: builder.query<LocationHierarchyResponse, { stateId?: string; districtId?: string }>({
      query: (params) => ({
        url: '/locations/hierarchy',
        params,
      }),
      providesTags: ['Location'],
    }),
    getLocationContainingPoint: builder.query<LocationContainingResponse, { latitude: number; longitude: number; type?: string }>({
      query: ({ latitude, longitude, type }) => ({
        url: '/locations/containing',
        params: { latitude, longitude, type },
      }),
      providesTags: ['Location'],
    }),
    getLocationById: builder.query<LocationsResponse, string>({
      query: (id) => `/locations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Location', id }],
    }),
    getAllLocations: builder.query<LocationsResponse, { type?: string; parentId?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/locations',
        params,
      }),
      providesTags: ['Location'],
    }),
  }),
});

export const {
  useGetLocationsByTypeQuery,
  useGetLocationHierarchyQuery,
  useGetLocationContainingPointQuery,
  useGetLocationByIdQuery,
  useGetAllLocationsQuery,
} = locationsApi;
