import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    candidates: [],
    jobs: [],
    loading: false,
    error: null,
};

const recrutmentSlice = createSlice({
    name: 'recrutment',
    initialState,
    reducers: {
        setCandidates: (state, action) => {
            state.candidates = action.payload;
        },
        setJobs: (state, action) => {
            state.jobs = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addJob: (state, action) => {
            state.jobs.push(action.payload);
        },
    },
});

export const { setCandidates, setJobs, setLoading, setError, addJob } = recrutmentSlice.actions;
export default recrutmentSlice.reducer;
