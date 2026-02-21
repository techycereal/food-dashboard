import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { auth } from "../../lib/firebase";
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const fetchEmails = createAsyncThunk(
  "emails/fetchEmails",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken(); // 🔥 always fresh

      const response = await axios.get(`${apiUrl}/get_emails`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.emails || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);
export const addEmail = createAsyncThunk(
  "emails/addEmail",
  async (email: string, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken(); // 🔥 always fresh

      const response = await axios.post(
        `${apiUrl}/add_email`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data; // updated emails array
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface EmailsState {
  emails: PayloadType[];
  status: "idle" | "loading" | "failed";
}

interface PayloadType {
  email: string;
}

const initialState: EmailsState = {
  emails: [],
  status: "idle",
};

const emailsSlice = createSlice({
  name: "emails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmails.fulfilled, (state, action: PayloadAction<PayloadType[]>) => {
        state.status = "idle";
        state.emails = action.payload;
      })
      .addCase(fetchEmails.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addEmail.fulfilled, (state, action: PayloadAction<PayloadType[]>) => {
        state.emails = action.payload;
      });
  },
});

export default emailsSlice.reducer;
