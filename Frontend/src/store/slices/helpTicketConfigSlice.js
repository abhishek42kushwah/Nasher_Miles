import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/help-ticket-config`;

/* ================================
   1. Fetch Configuration + Holidays
================================ */
export const fetchHelpTicketConfig = createAsyncThunk(
  'helpTicketConfig/fetch',
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch help ticket config'
      );
    }
  }
);

/* ================================
   2. Update Configuration
================================ */
export const updateHelpTicketConfig = createAsyncThunk(
  'helpTicketConfig/update',
  async (payload, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const res = await axios.put(API_URL, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update configuration'
      );
    }
  }
);

/* ================================
   3. Add Holiday
================================ */
export const addHoliday = createAsyncThunk(
  'helpTicketConfig/addHoliday',
  async (holidayData, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const res = await axios.post(
        `${API_URL}/holidays`,
        holidayData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to add holiday'
      );
    }
  }
);

/* ================================
   4. Remove Holiday
================================ */
export const removeHoliday = createAsyncThunk(
  'helpTicketConfig/removeHoliday',
  async (holidayId, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      await axios.delete(`${API_URL}/holidays/${holidayId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return holidayId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to remove holiday'
      );
    }
  }
);

/* ================================
   Slice
================================ */
const helpTicketConfigSlice = createSlice({
  name: 'helpTicketConfig',
  initialState: {
    settings: null,     // config object
    holidays: [],       // holiday list
    isLoading: false,
    error: null,
    isSaving: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* Fetch */
      .addCase(fetchHelpTicketConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHelpTicketConfig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload.settings;
        state.holidays = action.payload.holidays;
      })
      .addCase(fetchHelpTicketConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      /* Update Settings */
      .addCase(updateHelpTicketConfig.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateHelpTicketConfig.fulfilled, (state, action) => {
        state.isSaving = false;
        state.settings = action.payload;
      })
      .addCase(updateHelpTicketConfig.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      })

      /* Add Holiday */
      .addCase(addHoliday.fulfilled, (state, action) => {
        state.holidays.push(action.payload);
      })

      /* Remove Holiday */
      .addCase(removeHoliday.fulfilled, (state, action) => {
        state.holidays = state.holidays.filter(
          (h) => h.id !== action.payload
        );
      });
  },
});

export default helpTicketConfigSlice.reducer;
