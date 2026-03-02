import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/delegations`;

// Async thunk to fetch all delegations
export const /* `fetchDelegations` is an async thunk function that is used to fetch all delegations
from the API. It makes a GET request to the API endpoint
`/api/delegations` with the authorization token from the Redux state. If
the request is successful, it returns the response data (list of delegations). If there
is an error, it handles the error by returning the error message or a default message
'Failed to fetch delegations'. */
fetchDelegations = createAsyncThunk(
    'delegation/fetchDelegations',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch delegations');
        }
    }
);

// Async thunk to fetch a single delegation by ID
export const fetchDelegationById = createAsyncThunk(
    'delegation/fetchDelegationById',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch delegation');
        }
    }
);

// Async thunk to create a delegation
export const createDelegation = createAsyncThunk(
    'delegation/createDelegation',
    async (formData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.post(API_URL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create delegation');
        }
    }
);

// Async thunk to update delegation status (or any field via update)
export const updateDelegationStatus = createAsyncThunk(
    'delegation/updateStatus',
    async ({ id, ...updates }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.put(`${API_URL}/${id}`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Async thunk to add a remark
export const addDelegationRemark = createAsyncThunk(
    'delegation/addRemark',
    async ({ id, remark }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.post(`${API_URL}/${id}/remarks`, { remark }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add remark');
        }
    }
);

// Async thunk to update a delegation
export const updateDelegation = createAsyncThunk(
    'delegation/updateDelegation',
    async ({ id, formData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            const response = await axios.put(`${API_URL}/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update delegation');
        }
    }
);

// Async thunk to delete a delegation
export const deleteDelegation = createAsyncThunk(
    'delegation/deleteDelegation',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete delegation');
        }
    }
);

const delegationSlice = createSlice({
    name: 'delegation',
    initialState: {
        delegations: [],
        delegationsById: {}, // Normalized cache: { [id]: delegation }
        isLoading: false,
        isFetching: false, // For background fetches
        error: null,
        lastFetched: null, // Timestamp for cache invalidation
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        invalidateCache: (state) => {
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all delegations
            .addCase(fetchDelegations.pending, (state) => {
                state.isLoading = state.delegations.length === 0;
                state.isFetching = true;
                state.error = null;
            })
            .addCase(fetchDelegations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isFetching = false;
                state.delegations = action.payload;
                // Normalize data for quick lookup
                state.delegationsById = action.payload.reduce((acc, delegation) => {
                    acc[delegation.id] = delegation;
                    return acc;
                }, {});
                state.lastFetched = Date.now();
            })
            .addCase(fetchDelegations.rejected, (state, action) => {
                state.isLoading = false;
                state.isFetching = false;
                state.error = action.payload;
            })

            // Fetch single delegation
            .addCase(fetchDelegationById.pending, (state) => {
                state.isFetching = true;
                state.error = null;
            })
            .addCase(fetchDelegationById.fulfilled, (state, action) => {
                state.isFetching = false;
                // Update both the array and the normalized cache
                const index = state.delegations.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.delegations[index] = action.payload;
                } else {
                    state.delegations.push(action.payload);
                }
                state.delegationsById[action.payload.id] = action.payload;
            })
            .addCase(fetchDelegationById.rejected, (state, action) => {
                state.isFetching = false;
                state.error = action.payload;
            })

            // Create delegation
            .addCase(createDelegation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDelegation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.delegations.unshift(action.payload);
                state.delegationsById[action.payload.id] = action.payload;
            })
            .addCase(createDelegation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update delegation
            .addCase(updateDelegation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDelegation.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.delegations.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.delegations[index] = action.payload;
                }
                state.delegationsById[action.payload.id] = action.payload;
            })
            .addCase(updateDelegation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Delete delegation
            .addCase(deleteDelegation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDelegation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.delegations = state.delegations.filter(d => d.id !== action.payload);
                delete state.delegationsById[action.payload];
            })
            .addCase(deleteDelegation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Update Status
            .addCase(updateDelegationStatus.fulfilled, (state, action) => {
                // Optimistic update: Update local state immediately with returned data
                const index = state.delegations.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.delegations[index] = action.payload;
                }
                state.delegationsById[action.payload.id] = action.payload;
            })

            // Add Remark
            .addCase(addDelegationRemark.fulfilled, (state, action) => {
                // Update local state immediately with returned data
                const index = state.delegations.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.delegations[index] = action.payload;
                }
                state.delegationsById[action.payload.id] = action.payload;
            });
    },
});

export const { clearError, invalidateCache } = delegationSlice.actions;
export default delegationSlice.reducer;
