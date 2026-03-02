import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/checklist`;

// Fetch all checklists
export const fetchChecklists = createAsyncThunk(
    'checklist/fetchChecklists',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch checklists');
        }
    }
);

// Create a new checklist (Master Template)
export const createChecklist = createAsyncThunk(
    'checklist/createChecklist',
    async (checklistData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            // Note: Creating a master template
            const response = await axios.post(`${API_URL}/master`, checklistData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // After creating master, we might want to trigger generation manually for immediate feedback
            // or just reload list if we view masters. 
            // For this UI, the user expects to see the "Task" immediately. 
            // We can optionally trigger generation endpoint
            await axios.get(`${API_URL}/test-generation`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create checklist');
        }
    }
);

// Delete a checklist task
export const deleteChecklist = createAsyncThunk(
    'checklist/deleteChecklist',
    async (id, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            await axios.delete(`${API_URL}/task/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete checklist');
        }
    }
);

// Update a checklist task details
export const updateChecklistTask = createAsyncThunk(
    'checklist/updateChecklistTask',
    async ({ id, ...data }, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await axios.put(`${API_URL}/task/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update checklist task');
        }
    }
);

// Update a checklist task status (Patch)
export const updateChecklistStatus = createAsyncThunk(
    'checklist/updateStatus',
    async ({ id, data }, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            // Determine content type automatically (if FormData, browser handles it)
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {})
                }
            };

            const response = await axios.patch(`${API_URL}/task/${id}`, data, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const checklistSlice = createSlice({
    name: 'checklist',
    initialState: {
        checklists: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchChecklists.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchChecklists.fulfilled, (state, action) => {
                state.isLoading = false;
                state.checklists = action.payload;
            })
            .addCase(fetchChecklists.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createChecklist.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createChecklist.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createChecklist.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Task
            .addCase(updateChecklistTask.fulfilled, (state, action) => {
                const index = state.checklists.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.checklists[index] = { ...state.checklists[index], ...action.payload };
                }
            })
            // Update Status (Patch)
            .addCase(updateChecklistStatus.fulfilled, (state, action) => {
                const index = state.checklists.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.checklists[index] = { ...state.checklists[index], ...action.payload };
                }
            })
            // Delete
            .addCase(deleteChecklist.fulfilled, (state, action) => {
                state.checklists = state.checklists.filter((item) => item.id !== action.payload);
            });
    },
});

export default checklistSlice.reducer;
