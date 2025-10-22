// app/productsSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../app/store"; // adjust import path
export interface Item {
  id: string;
  item: string;
  price: number;
  fileUrl: string;
  category: string; // <-- add this
  quantity: string;
}

interface ProductsState {
  items: Item[];
  status: "idle" | "loading" | "failed";
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
};

// Fetch products only if items array is empty
export const fetchProducts = createAsyncThunk<
  Item[],
  void,
  { state: RootState }
>(
  "products/get_data",
  async (_, { getState }) => {
    const token = getState().auth.token; // ✅ use token from authSlice
    console.log(token)
    if (!token) throw new Error("No token available");

    const response = await axios.get("http://localhost:3001/get_data", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.data || [];
  },
  {
    condition: (_, { getState }) => {
      const { products } = getState();
      return products.items.length === 0; // skip if already cached
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

export const { addProduct, updateProduct, deleteProduct } = productsSlice.actions;
export default productsSlice.reducer;
