import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
  username: string | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("admin_token"),
  username: localStorage.getItem("admin_username"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.token = action.payload.token;
      state.username = action.payload.username;
      localStorage.setItem("admin_token", action.payload.token);
      localStorage.setItem("admin_username", action.payload.username);
    },
    logout: (state) => {
      state.token = null;
      state.username = null;
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
