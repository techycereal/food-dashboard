import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchEmails = createAsyncThunk("emails/fetchEmails", async (_, { getState }) => {
  const token = getState().auth.token;
  console.log(token)
  const response = await axios.get("http://localhost:3001/get_emails", {
      headers: { Authorization: `Bearer ${token}` },
    });
  console.log(response.data)
  return response.data.emails || [];
});

export const addEmail = createAsyncThunk(
  "emails/addEmail",
  async (email: string, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post("http://localhost:3001/add_email", { email }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data; // updated emails array
  }
);

interface EmailsState {
  emails: string[];
  status: "idle" | "loading" | "failed";
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
      .addCase(fetchEmails.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.status = "idle";
        state.emails = action.payload;
      })
      .addCase(fetchEmails.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(addEmail.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.emails = action.payload;
      });
  },
});

export default emailsSlice.reducer;
