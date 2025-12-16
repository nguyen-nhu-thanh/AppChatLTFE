import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: {
        username: string;
        isLoggedIn: boolean;
    } | null;
    loginCode: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loginCode: null,
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        registerSuccess: (state, action: PayloadAction<{username: string}>) => {
            state.loading = false;
            state.user = {
                username: action.payload.username,
                isLoggedIn: true,
            }
        },
        loginSuccess: (state, action: PayloadAction<{ username: string; code: string }>)=> {
            state.loading = false;
            state.user = {
                username: action.payload.username,
                isLoggedIn: true,
            };
            state.loginCode = action.payload.code;
        },
        authFailure: (state, action: PayloadAction<string>)=> {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.loginCode = null;
            state.error = null;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },

});

export const {
    authStart,
    registerSuccess,
    loginSuccess,
    authFailure,
    logout,
    clearError,
} = authSlice.actions;

export default authSlice.reducer;