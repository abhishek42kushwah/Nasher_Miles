import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const API_URL = `${API_BASE_URL}/api/todos`;




export const fetchTodos = createAsyncThunk(
  "todo/fetchTodos",
  async (_, { getState, rejectWithValue }) => {
    const { token, user } = getState().auth;

    try {
      const response = await axios.get(
        `${API_URL}/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch ToDos"
      );
    }
  }
);


// Create a new todo
export const createTodo = createAsyncThunk(
    'todo/createTodo',
    async (todoData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await axios.post(API_URL, todoData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create ToDo');
        }
    }
);

// Update todo status (Optimistic UI handled in slice)
export const updateTodoStatus = createAsyncThunk(
    'todo/updateStatus',
    async ({ id, status }, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

// Delete todo
export const deleteTodo = createAsyncThunk(
    'todo/deleteTodo',
    async (id, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete ToDo');
        }
    }
);

const todoSlice = createSlice({
    name: 'todo',
    initialState: {
        todos: [], // Flat list from API
        isLoading: false,
        error: null,
    },
    reducers: {
        // Optimistically update status for smooth drag-and-drop
        moveTodoOptimistically: (state, action) => {
            const { id, newStatus } = action.payload;
            const todo = state.todos.find(t => t.todo_id === id);
            if (todo) {
                todo.status = newStatus;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.todos = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.todos.unshift(action.payload);
            })
            .addCase(updateTodoStatus.fulfilled, (state, action) => {
                const index = state.todos.findIndex(t => t.todo_id === action.payload.todo_id);
                if (index !== -1) {
                    state.todos[index] = action.payload;
                }
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter(t => t.todo_id !== action.payload);
            });
    },
});

export const { moveTodoOptimistically } = todoSlice.actions;
export default todoSlice.reducer;
