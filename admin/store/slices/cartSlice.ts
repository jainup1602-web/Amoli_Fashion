import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
  synced: boolean; // Track if cart is synced with server
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
  synced: false,
};

// Helper functions
const saveToLocalStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

const calculateItemCount = (items: CartItem[]) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Sync local cart with server after login
export const syncCartWithServer = createAsyncThunk(
  'cart/syncWithServer',
  async (token: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const localItems = state.cart.items;

      // Fetch server cart
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      const serverCart = data.cart;

      // Merge local cart with server cart
      if (localItems.length > 0) {
        // Send local items to server
        for (const item of localItems) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.productId,
              quantity: item.quantity,
            }),
          });
        }

        // Fetch updated cart
        const updatedResponse = await fetch('/api/cart', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const updatedData = await updatedResponse.json();
        return updatedData.cart;
      }

      return serverCart;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add item to cart (with server sync for authenticated users)
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ productId, quantity = 1, token }: { productId: string; quantity?: number; token?: string }, { rejectWithValue }) => {
    // Don't make API call if no token
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'add',
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        // Silently handle 401 errors - they're expected for guest users
        if (response.status === 401) {
          return null; // This will be handled by the component
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.cart;
    } catch (error: any) {
      // Don't log 401 errors to reduce console noise
      if (!error.message?.includes('401') && !error.message?.includes('Unauthorized')) {
        console.error('Cart API error:', error);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Fetch cart from server (for logged-in users)
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      return data.cart;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    loadCart: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cart');
        if (saved) {
          state.items = JSON.parse(saved);
          state.total = calculateTotal(state.items);
          state.itemCount = calculateItemCount(state.items);
        }
      }
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      saveToLocalStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (item) {
        item.quantity = action.payload.quantity;
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        saveToLocalStorage(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      saveToLocalStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      state.synced = false;
      saveToLocalStorage([]);
    },
    setCartFromServer: (state, action: PayloadAction<any>) => {
      // Convert server cart format to local format
      const serverItems = action.payload.items || [];
      state.items = serverItems.map((item: any) => ({
        productId: item.productId._id || item.productId,
        name: item.productId.name,
        slug: item.productId.slug,
        image: item.productId.images?.[0] || '',
        price: item.price,
        originalPrice: item.productId.originalPrice,
        quantity: item.quantity,
        stock: item.productId.stock,
      }));
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
      state.synced = true;
      saveToLocalStorage(state.items);
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId._id || item.productId,
          name: item.productId.name,
          slug: item.productId.slug,
          image: item.productId.images?.[0] || '',
          price: item.price,
          originalPrice: item.productId.originalPrice,
          quantity: item.quantity,
          stock: item.productId.stock,
        }));
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        state.synced = true;
        saveToLocalStorage(state.items);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync cart
    builder
      .addCase(syncCartWithServer.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncCartWithServer.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId._id || item.productId,
          name: item.productId.name,
          slug: item.productId.slug,
          image: item.productId.images?.[0] || '',
          price: item.price,
          originalPrice: item.productId.originalPrice,
          quantity: item.quantity,
          stock: item.productId.stock,
        }));
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
        state.synced = true;
        saveToLocalStorage(state.items);
      })
      .addCase(syncCartWithServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to cart async
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Server response - update from server data
          const serverItems = action.payload.items || [];
          state.items = serverItems.map((item: any) => ({
            productId: item.productId._id || item.productId,
            name: item.productId.name,
            slug: item.productId.slug,
            image: item.productId.images?.[0] || '',
            price: item.price,
            originalPrice: item.productId.originalPrice,
            quantity: item.quantity,
            stock: item.productId.stock,
          }));
          state.total = calculateTotal(state.items);
          state.itemCount = calculateItemCount(state.items);
          state.synced = true;
          saveToLocalStorage(state.items);
        }
        // If payload is null, it means user is not authenticated - local state already updated
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  loadCart, 
  addToCart, 
  updateQuantity, 
  removeFromCart, 
  clearCart,
  setCartFromServer 
} = cartSlice.actions;

export default cartSlice.reducer;
