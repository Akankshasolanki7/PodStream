import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false,
        user: null,
        role: 'user'
    },
    reducers: {
        login(state, action) {
            state.isLoggedIn = true;
            state.user = action.payload.user;
            state.role = action.payload.role || 'user';
        },
        logout(state) {
            state.isLoggedIn = false;
            state.user = null;
            state.role = 'user';
        },
        setUser(state, action) {
            state.user = action.payload.user;
            state.role = action.payload.role || 'user';
        }
    }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;