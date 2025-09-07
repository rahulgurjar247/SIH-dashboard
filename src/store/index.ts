import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './api/authApi';
import { issuesApi } from './api/issuesApi';
import { usersApi } from './api/usersApi';
import { departmentsApi } from './api/departmentsApi';
import { locationsApi } from './api/locationsApi';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import filtersSlice from './slices/filtersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    filters: filtersSlice,
    [authApi.reducerPath]: authApi.reducer,
    [issuesApi.reducerPath]: issuesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [departmentsApi.reducerPath]: departmentsApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
      .concat(authApi.middleware)
      .concat(issuesApi.middleware)
      .concat(usersApi.middleware)
      .concat(departmentsApi.middleware)
      .concat(locationsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
