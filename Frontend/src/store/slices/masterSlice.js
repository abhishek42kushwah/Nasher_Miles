import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

// Use relative path to let Vite proxy handle the base URL
const API_URL = `${API_BASE_URL}/api/master`;

export const fetchEmployees = createAsyncThunk(
  "master/fetchEmployees",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employees",
      );
    }
  },
);

export const fetchDepartments = createAsyncThunk(
  "master/fetchDepartments",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch departments",
      );
    }
  },
);

// New Thunks for Help Ticket
export const fetchLocations = createAsyncThunk(
  "master/fetchLocations",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`${API_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch locations",
      );
    }
  },
);

export const fetchPCAccountables = createAsyncThunk(
  "master/fetchPCAccountables",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`${API_URL}/pc-accountables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch PC accountables",
      );
    }
  },
);

export const fetchProblemSolvers = createAsyncThunk(
  "master/fetchProblemSolvers",
  async (_, { getState, rejectWithValue }) => {
    const { token } = getState().auth;
    try {
      const response = await axios.get(`${API_URL}/problem-solvers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch problem solvers",
      );
    }
  },
);


export const getHelpTicketHistoryById = createAsyncThunk(
  "master/getHelpTicketHistoryById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;

      const response = await axios.get(
        `${API_BASE_URL}/api/help-tickets/history/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch help ticket history"
      );
    }
  }
);


const masterSlice = createSlice({
  name: "master",
  initialState: {
    employees: [],
    departments: [],
    helpTicketHistory: null,
    locations: [],
    pcAccountables: [],
    problemSolvers: [],
    isLoading: false,
    error: null,
    lastFetchedDetails: {
      employees: 0,
      departments: 0,
      locations: 0,
      pcAccountables: 0,
      problemSolvers: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
  builder
    // Employees
    .addCase(fetchEmployees.pending, (state) => {
      if (state.employees.length === 0) state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchEmployees.fulfilled, (state, action) => {
      state.isLoading = false;
      state.employees = action.payload;
      state.lastFetchedDetails.employees = Date.now();
    })
    .addCase(fetchEmployees.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // Departments
    .addCase(fetchDepartments.pending, (state) => {
      if (state.departments.length === 0) state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchDepartments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.departments = action.payload;
      state.lastFetchedDetails.departments = Date.now();
    })
    .addCase(fetchDepartments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // Locations
    .addCase(fetchLocations.pending, (state) => {
      if (state.locations.length === 0) state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchLocations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.locations = action.payload;
      state.lastFetchedDetails.locations = Date.now();
    })
    .addCase(fetchLocations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // PC Accountables
    .addCase(fetchPCAccountables.pending, (state) => {
      if (state.pcAccountables.length === 0) state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchPCAccountables.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pcAccountables = action.payload;
      state.lastFetchedDetails.pcAccountables = Date.now();
    })
    .addCase(fetchPCAccountables.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // Problem Solvers
    .addCase(fetchProblemSolvers.pending, (state) => {
      if (state.problemSolvers.length === 0) state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchProblemSolvers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.problemSolvers = action.payload;
      state.lastFetchedDetails.problemSolvers = Date.now();
    })
    .addCase(fetchProblemSolvers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // ✅ Help Ticket History
    .addCase(getHelpTicketHistoryById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(getHelpTicketHistoryById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.helpTicketHistory = action.payload;
    })
    .addCase(getHelpTicketHistoryById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
},

});

export default masterSlice.reducer;
