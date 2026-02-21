import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Key, ReactNode } from "react";
import type { RootState } from "../../app/store";
import { auth } from "../../lib/firebase";

/* =======================
   TYPES
======================= */

type Item = {
  quantity: ReactNode;
  item: ReactNode;
  id: {
    quantity: number;
    item: string;
    timestamp: Date;
  };
};

type Report = {
  totalPrice: number;
  _ts: number;
  id: Key | null | undefined;
  items: Item[];
  email: string;
  price: number;
};

type Purchase = {
  id: number;
  email: string;
  price: number;
  item: string;
  quantity: number;
  timestamp: number;
};

type PurchasesResponse = {
  piId: string;
  data: Purchase[];
};

/* =======================
   THUNKS
======================= */
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const fetchReports = createAsyncThunk<
  Report[],
  void,
  { state: RootState }
>("reports/fetchReports", async (_, { }) => {
  const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

  const response = await axios.get(`${apiUrl}/get_report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(response.data)

  return response.data.message || [];
});

export const fetchTimeReports = createAsyncThunk<
  any[],
  void,
  { state: RootState }
>("reports/fetchTimeReports", async (_, { }) => {
  const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

  const response = await axios.get(`${apiUrl}/get_time_report`, {
    headers: { Authorization: `Bearer ${token}` },
  });
console.log(response.data)
  return response.data.message || [];
});

export const fetchPurchases = createAsyncThunk<
  PurchasesResponse,
  void,
  { state: RootState }
>("reports/fetchPurchases", async (_, { }) => {
  const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

  const response = await axios.get(`${apiUrl}/get_purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(response.data)
  return response.data.data;
});

/* =======================
   STATE
======================= */

interface ReportsState {
  reports: Report[];
  timeReports: any[];
  purchases: Purchase[];

  status: "idle" | "loading" | "failed";
  timeStatus: "idle" | "loading" | "failed";
  purchaseStatus: "idle" | "loading" | "failed";
}

const initialState: ReportsState = {
  reports: [],
  timeReports: [],
  purchases: [],

  status: "idle",
  timeStatus: "idle",
  purchaseStatus: "idle",
};

/* =======================
   SLICE
======================= */

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /* -------- Reports -------- */
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

    /* -------- Time Reports -------- */
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

    /* -------- Purchases -------- */
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.purchaseStatus = "loading";
      })
      .addCase(
        fetchPurchases.fulfilled,
        (state, action: PayloadAction<PurchasesResponse>) => {
          state.purchaseStatus = "idle";
          console.log(action.payload)
          console.log(action.payload.data)
          state.purchases = [
            ...state.purchases,
            ...action.payload.data,
          ];
        }
      )
      .addCase(fetchPurchases.rejected, (state) => {
        state.purchaseStatus = "failed";
      });
  },
});

export default reportsSlice.reducer;
