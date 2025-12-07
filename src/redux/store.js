import { configureStore } from "@reduxjs/toolkit";
import { SignupReducer } from "./features/SignUp/SignupSlice";
import { useDispatch } from "react-redux";
import { SigninReducer } from "./features/SignIn/SigninSlice";
import { profileSlice } from "./features/profile/profileSlice";

export const store = configureStore({
  reducer: {
    signup:SignupReducer,
    signin:SigninReducer,
    [profileSlice.reducerPath]:profileSlice.reducer,
  },
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
    profileSlice.middleware
    ),
 
});

export const useAppDispatch = () => useDispatch();
