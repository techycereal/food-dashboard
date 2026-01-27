// app/productsSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { auth } from "../../lib/firebase";

export interface Item {
  id: string;
  item: string;
  price: number;
  fileUrl: string;
  category: string;
  description: string;
  quantity: string;
}

interface ProductsState {
  items: Item[];
  name: string;
  status: "idle" | "loading" | "failed";
  tutorial: Tutorial;
  tutorialFetched: boolean;
}

interface Tutorial {
  [key: string]: boolean;
  window: boolean,
  reports: boolean,
  offers: boolean,
  settings: boolean
}

const initialState: ProductsState = {
  items: [],
  name: "",
  status: "idle",
  tutorial: {
    window: false,
    reports: false,
    offers: false,
    settings: false
  },
  tutorialFetched: false
};

// Fetch products only if items array is empty
export const fetchProducts = createAsyncThunk<Item[]>(
  "products/get_data",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken(); // 🔥 always fresh

      const response = await axios.get("https://food-truck-backend-e6gbg0eth6g3hhhk.eastus-01.azurewebsites.net/get_data", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { products: ProductsState };
      return state.products.items.length === 0; // skip if already cached
    },
  }
);

export const fetchTutorial = createAsyncThunk<Tutorial>(
  "products/get_tutorial",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken(); // 🔥 always fresh

      const response = await axios.get("https://food-truck-backend-e6gbg0eth6g3hhhk.eastus-01.azurewebsites.net/get_tutorial", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('here')
      console.log(response.data.data.tutorial)
      return response.data.data.tutorial;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { products: ProductsState };
      // ✅ Only fetch if tutorial is empty
      return state.products.tutorialFetched === false
    },
  }
);

export const changeTutorialStatusAsync = createAsyncThunk<
  string, // return type
  string // payload type
>(
  "products/change_tutorial_status",
  async (section) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    // Only call backend if the section is "offers"
    if (section === "offers") {
      const token = await user.getIdToken();
      await axios.put(
        "https://food-truck-backend-e6gbg0eth6g3hhhk.eastus-01.azurewebsites.net/finish_tutorial",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    }

    return section; // return the section so extraReducer can update state
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload);
    },
    updateProduct: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<Item> }>
    ) => {
      const { id, changes } = action.payload;
      const existingProduct = state.items.find((p) => p.id === id);
      if (existingProduct) Object.assign(existingProduct, changes);
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    addName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = "failed";
      })
      // Tutorial
      .addCase(fetchTutorial.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTutorial.fulfilled, (state, action) => {
        state.tutorial = action.payload;
        state.status = "idle";
      })
      .addCase(fetchTutorial.rejected, (state) => {
        state.status = "failed";
      })
      // Handle the async tutorial status update
      .addCase(changeTutorialStatusAsync.fulfilled, (state, action) => {
        const section = action.payload;
        (state.tutorial as Tutorial)[section] = false; // mark as done
      });
  },
});


export const {
  addProduct,
  updateProduct,
  deleteProduct,
  addName
} = productsSlice.actions;

export default productsSlice.reducer;
