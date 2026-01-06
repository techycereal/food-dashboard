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
}

const initialState: ProductsState = {
  items: [],
  name: "",
  status: "idle",
};

// Fetch products only if items array is empty
export const fetchProducts = createAsyncThunk<Item[]>(
  "products/get_data",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken(); // 🔥 always fresh

      const response = await axios.get("http://localhost:3001/get_data", {
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

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload);
    },
    updateProduct: (
      state,
      action: PayloadAction<{ index: number; item: Item }>
    ) => {
      const { index, item } = action.payload;
      if (state.items[index]) {
        state.items[index] = item;
      }
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
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  addName,
} = productsSlice.actions;

export default productsSlice.reducer;
