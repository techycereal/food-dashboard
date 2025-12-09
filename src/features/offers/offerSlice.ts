import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../app/store";
//
// TYPES
//

// Dynamic deal object
export type DealType = Record<
  string,
  {
    name: string;
    future: string | null;
    show: number;
  }
>;

export interface Offers {
  deals: DealType;
  business: string;
  id: string;
}

interface OffersState {
  selectedDeals: Offers;
  status: "idle" | "loading" | "failed" | "success";
}


//
// INITIAL STATE
//

const initialState: OffersState = {
  selectedDeals: { deals: {}, business: "", id: "" },
  status: "idle",
};

//
// THUNKS
//

export const fetchOffers = createAsyncThunk<
  Offers,
  void,
  { state: RootState }
>("offers/fetchOffers", async (_, { getState }) => {
  const token = getState().auth.token;

  const response = await axios.get("http://localhost:3001/get_offers", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = response.data.data?.[0];

  return (
    data || {
      deals: {},
      business: "",
      id: "",
    }
  );
});

export const saveOffers = createAsyncThunk<
  Offers,
  { deals: DealType; id: string },
  { state: RootState }
>("offers/saveOffers", async ({ deals, id }, { getState }) => {
  const token = getState().auth.token;

  const response = await axios.post(
    "http://localhost:3001/add_offer",
    { deals, id },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return (
    response.data.data?.[0] || {
      deals,
      business: "Alex",
      id,
    }
  );
});

//
// SLICE
//

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    toggleDeal: (
      state,
      action: PayloadAction<{
        name: string;
        future: string | null;
        show: number;
      }>
    ) => {
      const { name, future, show } = action.payload;

      // Toggle logic
      if (state.selectedDeals.deals[name]) {
        delete state.selectedDeals.deals[name];
      } else {
        state.selectedDeals.deals[name] = { name, future, show };
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
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.status = "idle";
        state.selectedDeals = action.payload;
      })
      .addCase(fetchOffers.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(saveOffers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveOffers.fulfilled, (state, action) => {
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
