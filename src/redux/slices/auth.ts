import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

interface UserDataState {
  token: string | null;
  userId: string | number | null;
  user: any | null;
  isLogin: boolean;
  isOnboardingSeen: boolean;
  rememberMe: boolean;
  email: string;
  password: string;
}

const initialState: UserDataState = {
  token: null,
  userId: null,
  user: null,
  isLogin: false,
  isOnboardingSeen: false,
  rememberMe: false,
  email: '',
  password: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | number | null>) => {
      state.userId = action.payload;
    },
    setUserData: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
    },
    setIsLogin: (state, action: PayloadAction<boolean>) => {
      state.isLogin = action.payload;
    },
    setOnboardingSeen: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingSeen = action.payload;
    },
    setRememberData: (
      state,
      action: PayloadAction<{
        email: string;
        password: string;
        rememberMe: boolean;
      }>,
    ) => {
      const {email, password, rememberMe} = action.payload;

      state.rememberMe = rememberMe;

      if (rememberMe) {
        state.email = email;
        state.password = password;
      } else {
        state.email = '';
        state.password = '';
      }
    },
    setUserLogout: state => {
      state.token = null;
      state.userId = null;
      state.user = null;
      state.isLogin = false;
    },
  },
});

export const {
  setTokens,
  setUserId,
  setUserData,
  setIsLogin,
  setOnboardingSeen,
  setUserLogout,
  setRememberData,
} = authSlice.actions;

export const authSelector = (state: RootState) => state.auth;

export default authSlice.reducer;
