import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import tasksReducer from './tasksSlice';
import categoriesReducer from './categoriesSlice';
import shopReducer from './shopSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: tasksReducer,
    categories: categoriesReducer,
    shop: shopReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/setCurrentUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['user.currentUser']
      }
    })
});

export default store;
