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
  Purchase[], // Change this from PurchasesResponse to Purchase[]
  void,
  { state: RootState }
>("reports/fetchPurchases", async (_, { }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();

  const response = await axios.get(`${apiUrl}/get_purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Now this matches the Purchase[] return type defined above
  return response.data.data;
});
/* =======================
   STATE
======================= */

export interface ReportsState {
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
  // REPLACE the state with the new array from the server
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
  // REPLACE the state
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
      .addCase(fetchPurchases.fulfilled, (state, action: PayloadAction<Purchase[]>) => {
  state.purchaseStatus = "idle";
  // REPLACE the state (assuming payload is the array of purchases)
  state.purchases = action.payload;
})
      .addCase(fetchPurchases.rejected, (state) => {
        state.purchaseStatus = "failed";
      });
  },
});

export default reportsSlice.reducer;
