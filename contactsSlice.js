import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = import.meta.env.VITE_API_URL + '/api';

export const fetchContacts = createAsyncThunk('contacts/fetchAll', async (search = '') => {
  const res = await fetch(`${API}/contacts?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
});

export const createContact = createAsyncThunk('contacts/create', async (data, { rejectWithValue }) => {
  const res = await fetch(`${API}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return rejectWithValue(json);
  return json;
});

export const updateContact = createAsyncThunk('contacts/update', async ({ id, data }, { rejectWithValue }) => {
  const res = await fetch(`${API}/contacts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) return rejectWithValue(json);
  return json;
});

export const deleteContact = createAsyncThunk('contacts/delete', async (id, { rejectWithValue }) => {
  const res = await fetch(`${API}/contacts/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) return rejectWithValue(json);
  return { id, message: json.message };
});

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    list: [],
    loading: false,
    error: null,
    fieldErrors: {},
    successMessage: null,
    searchQuery: '',
  },
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.fieldErrors = {};
      state.successMessage = null;
    },
    setSearch(state, action) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchContacts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchContacts.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchContacts.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      // Create
      .addCase(createContact.pending, (state) => { state.loading = true; state.error = null; state.fieldErrors = {}; })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.successMessage = `Contact "${action.payload.first_name} ${action.payload.last_name}" created!`;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) state.fieldErrors = action.payload.errors;
        else state.error = action.payload?.error || 'Failed to create contact';
      })
      // Update
      .addCase(updateContact.pending, (state) => { state.loading = true; state.error = null; state.fieldErrors = {}; })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.successMessage = `Contact updated successfully!`;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) state.fieldErrors = action.payload.errors;
        else state.error = action.payload?.error || 'Failed to update contact';
      })
      // Delete
      .addCase(deleteContact.pending, (state) => { state.loading = true; })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload.id);
        state.successMessage = 'Contact deleted.';
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to delete contact';
      });
  },
});

export const { clearMessages, setSearch } = contactsSlice.actions;
export default contactsSlice.reducer;
