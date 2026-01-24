import { configureStore } from '@reduxjs/toolkit';
import recrutmentReducer from './slices/recrutmentSlice'

export const store = configureStore({
    reducer: {
        recrutment: recrutmentReducer,
    },
});