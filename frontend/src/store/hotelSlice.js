import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const API = 'http://localhost:5000';
const api = axios.create({ baseURL: `${API}/api/hotels` });

export const fetchHotels = createAsyncThunk('hotels/fetchAll', async (params) => {
  const { data } = await api.get('/', { params });
  return data;
});

export const fetchHotel = createAsyncThunk('hotels/fetchOne', async (id) => {
  const { data } = await api.get(`/${id}`);
  return data;
});

export const saveHotel = createAsyncThunk(
  'hotels/save',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = id ? await api.put(`/${id}`, formData) : await api.post('/', formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.errors || ['Something went wrong']);
    }
  }
);

export const deleteHotel = createAsyncThunk('hotels/delete', async (id) => {
  await api.delete(`/${id}`);
  return id;
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: { items: [], total: 0, current: null, loading: false, error: null },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchHotels.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload.hotels; s.total = a.payload.total;
      })
      .addCase(fetchHotels.rejected, (s) => { s.loading = false; s.error = 'Failed to load hotels'; })
      .addCase(fetchHotel.pending, (s) => { s.loading = true; s.error = null; s.current = null; })
      .addCase(fetchHotel.fulfilled, (s, a) => { s.loading = false; s.current = a.payload; })
      .addCase(fetchHotel.rejected, (s) => { s.loading = false; s.error = 'Hotel not found'; });
  },
});

export const { clearCurrent } = hotelSlice.actions;
export default hotelSlice.reducer;
