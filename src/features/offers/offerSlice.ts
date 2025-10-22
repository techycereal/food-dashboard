import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Offers {
  deals: string[];
  business: string;
  id: string;
}

interface OffersState {
  selectedDeals: Offers;
  status: "idle" | "loading" | "failed" | "success";
}

const initialState: OffersState = {
  selectedDeals: { deals: [], business: "", id: "" },
  status: "idle",
};

// Fetch saved offers (with auth token)
export const fetchOffers = createAsyncThunk("offers/fetchOffers", async (_, { getState }) => {
  const token = getState().auth.token;
  console.log(token)
  const response = await axios.get("http://localhost:3001/get_offers", {
      headers: { Authorization: `Bearer ${token}` },
    });
  console.log(response.data);
  return response.data.data[0] || { deals: [], business: "", id: "" };
});

// Submit offers (pass both deals and id as an object, with auth token)
export const saveOffers = createAsyncThunk(
  "offers/saveOffers",
  async ({ deals, id }: { deals: string[]; id: string }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post(
      "http://localhost:3001/add_offer",
      { deals, id }, {
      headers: { Authorization: `Bearer ${token}` },
    }
    );
    console.log(response.data)
    return response.data.data?.[0] || { deals, business: "Alex", id };
  }
);

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    toggleDeal: (state, action: PayloadAction<string>) => {
      const dealIndex = state.selectedDeals.deals.indexOf(action.payload);
      if (dealIndex > -1) {
        state.selectedDeals.deals.splice(dealIndex, 1);
      } else {
        state.selectedDeals.deals.push(action.payload);
      }
    },
    setBusiness: (state, action: PayloadAction<string>) => {
      state.selectedDeals.business = action.payload;
    },
    setId: (state, action: PayloadAction<string>) => {
      state.selectedDeals.id = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOffers.fulfilled, (state, action: PayloadAction<Offers>) => {
        state.status = "idle";
        state.selectedDeals = action.payload;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(saveOffers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveOffers.fulfilled, (state, action: PayloadAction<Offers>) => {
        state.status = "success";
        state.selectedDeals = action.payload;
      })
      .addCase(saveOffers.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { toggleDeal, setBusiness, setId } = offersSlice.actions;
export default offersSlice.reducer;
