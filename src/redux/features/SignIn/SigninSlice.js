import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {  baseURL } from "../../../config";
import toast from "react-hot-toast";

const initialState = {
  isloading: false,
  data: {},
};

export const SigninFunction = createAsyncThunk(
  "SigninFunction/Signin",
  async (data, thunkApi) => {
    const { rejectWithValue } = thunkApi;
    try {
      const res = await baseURL.post("/Authentication/login", data);
      if (res.status === 200) {
        toast.success("Successfully", {
          position: "bottom-center",
          duration: 1500,
          style: {
            backgroundColor: "black",
            color: "white",
            width: "fit-content",
          },
        });
      }
      console.log(res);
    } catch (error) {
      const errorobj = error;
      const errorMessages = errorobj.response?.data.error;
      if (errorMessages) {
        const allErrors = Object.values(errorMessages).flat().join(", ");
        toast.error(allErrors, {
          position: "bottom-center",
          duration: 1500,
        });
        return rejectWithValue(allErrors);
      }

    }
  }
);

export const signinSlice = createSlice({
  name: "Signin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
      builder.addCase(SigninFunction.pending, (state) => {
        state.isloading = true;
      });
      builder.addCase(SigninFunction.fulfilled, (state, action) => {
        state.isloading = false;
        state.data = action.payload ;
        
      });
      builder.addCase(SigninFunction.rejected, (state) => {
        state.isloading = false;
        state.data = {};
      });
    },
});

export const SigninReducer = signinSlice.reducer;
