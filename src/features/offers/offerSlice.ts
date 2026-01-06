import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../app/store";
import { auth } from "../../lib/firebase";
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
  const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

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
  { selectedDeals: DealType; id: string },
  { state: RootState }
>("offers/saveOffers", async ({ selectedDeals, id }, { getState }) => {
  const deals = selectedDeals
  const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();

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
  action: PayloadAction<{ name: string; future: string | null; show: number }>
) => {
  const { name, future, show } = action.payload;

  // Ensure deals object exists
  if (!state.selectedDeals.deals) {
    state.selectedDeals.deals = {};
  }

  if (state.selectedDeals.deals[name]) {
    delete state.selectedDeals.deals[name];
  } else {
    console.log(name)
    console.log(future)
    console.log(show)
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
