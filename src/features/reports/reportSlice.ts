import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Key } from "react";
import type { RootState } from "../../app/store";
type Item = {
  id: {
    quantity: number;
    item: string;
    timestamp: Date;
  };
};

type Report = {
  _ts: number;
  id: Key | null | undefined;
  items: Item[];
  email: string;
  price: number;
};

export const fetchReports = createAsyncThunk<void,{ state: RootState }>("reports/fetchReports", async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get("http://localhost:3001/get_report", {
      headers: { Authorization: `Bearer ${token}` },
    });
  return response.data.message || [];
});

export const fetchPurchases = createAsyncThunk<void,{ state: RootState }>("reports/fetchPurchases", async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get("http://localhost:3001/get_purchases", {
      headers: { Authorization: `Bearer ${token}` },
    });
  return response.data.message || [];
});

export const fetchTimeReports = createAsyncThunk<void,{ state: RootState }>("reports/fetchTimeReports", async (_, { getState }) => {
  const token = getState().auth.token;
  const response = await axios.get("http://localhost:3001/get_time_report", {
      headers: { Authorization: `Bearer ${token}` },
    });
  return response.data.message || [];
});

interface ReportsState {
  reports: Report[];
  timeReports: any[]; // 👉 if you know shape, replace `any` with type
  status: "idle" | "loading" | "failed";
  timeStatus: "idle" | "loading" | "failed";
}

const initialState: ReportsState = {
  reports: [],
  timeReports: [],
  status: "idle",
  timeStatus: "idle",
};

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // normal reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.status = "idle";
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state) => {
        state.status = "failed";
      });

    // time reports
    builder
      .addCase(fetchTimeReports.pending, (state) => {
        state.timeStatus = "loading";
      })
      .addCase(fetchTimeReports.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.timeStatus = "idle";
        state.timeReports = action.payload;
      })
      .addCase(fetchTimeReports.rejected, (state) => {
        state.timeStatus = "failed";
      });

      builder
      .addCase(fetchPurchases.pending, (state) => {
        state.timeStatus = "loading";
      })
      .addCase(fetchPurchases.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.timeStatus = "idle";
        state.timeReports = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state) => {
        state.timeStatus = "failed";
      });
  },
});

export default reportsSlice.reducer;
