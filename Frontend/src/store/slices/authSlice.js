import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/auth`;

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('loginTime', Date.now()); 

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Login failed');
        }
    }
);

export const updateUserTheme = createAsyncThunk(
    'auth/updateUserTheme',
    async (theme, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            await axios.put(`${API_URL}/theme`, { theme }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return theme;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to update theme');
        }
    }
);

const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: token && user ? JSON.parse(user) : null,
        token: token && user ? token : null,
        theme: (token && user) ? (JSON.parse(user).theme || 'light') : 'light',
        isLoading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.theme = 'light';
            state.error = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            if (state.user) {
                state.user.theme = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.theme = action.payload.user.theme || 'light';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateUserTheme.fulfilled, (state, action) => {
                state.theme = action.payload;
            });
    },
});

export const { logout, clearError, setTheme } = authSlice.actions;
export default authSlice.reducer;
