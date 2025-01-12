import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Async thunks for user operations
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (userId, { rejectWithValue }) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return {
        ...userDoc.data(),
        id: userId
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPoints = createAsyncThunk(
  'user/updatePoints',
  async ({ userId, points }, { rejectWithValue }) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { points });
      return points;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    userData: null,
    points: 500,
    isLoading: false,
    error: null
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.userData = null;
      state.points = 500;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userData = action.payload;
        state.points = action.payload?.points || 500;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserPoints.fulfilled, (state, action) => {
        state.points = action.payload;
      });
  }
});

export const { setCurrentUser, logout } = userSlice.actions;
export default userSlice.reducer;
