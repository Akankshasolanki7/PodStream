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
            if (action.payload) {
                state.user = action.payload.user || null;
                state.role = action.payload.role || 'user';
            } else {
                state.user = null;
                state.role = 'user';
            }
        },
        logout(state) {
            state.isLoggedIn = false;
            state.user = null;
            state.role = 'user';
        },
        setUser(state, action) {
            if (action.payload) {
                state.user = action.payload.user || null;
                state.role = action.payload.role || 'user';
            }
        }
    }
});

export const authActions = authSlice.actions;
export default authSlice.reducer;