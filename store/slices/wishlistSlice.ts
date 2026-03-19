import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  hoverImage?: string;
  price: number;
  originalPrice: number;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  synced: boolean;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  synced: false,
};

// Helper functions
const saveToLocalStorage = (items: WishlistItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }
};

// Sync local wishlist with server after login
export const syncWishlistWithServer = createAsyncThunk(
  'wishlist/syncWithServer',
  async (token: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { wishlist: WishlistState };
      const localItems = state.wishlist.items;

      // Fetch server wishlist
      const response = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      const serverWishlist = data.wishlist;

      // Merge local wishlist with server wishlist
      if (localItems.length > 0) {
        // Send local items to server
        for (const item of localItems) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.productId,
            }),
          });
        }

        // Fetch updated wishlist
        const updatedResponse = await fetch('/api/wishlist', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const updatedData = await updatedResponse.json();
        return updatedData.wishlist;
      }

      return serverWishlist;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Add item to wishlist on server
export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlistAsync',
  async ({ productId, token }: { productId: string; token: string }, { rejectWithValue }) => {
    // Don't make API call if no token
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        // Silently handle 401 errors - they're expected for guest users
        if (response.status === 401) {
          return null; // This will be handled by the component
        }
        throw new Error('Failed to add to wishlist');
      }
      
      const data = await response.json();
      return data.wishlist;
    } catch (error: any) {
      // Don't log 401 errors to reduce console noise
      if (!error.message?.includes('401') && !error.message?.includes('Unauthorized')) {
        console.error('Wishlist API error:', error);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Remove item from wishlist on server
export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlistAsync',
  async ({ productId, token }: { productId: string; token: string }, { rejectWithValue }) => {
    // Don't make API call if no token
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Silently handle 401 errors - they're expected for guest users
        if (response.status === 401) {
          return null; // This will be handled by the component
        }
        throw new Error('Failed to remove from wishlist');
      }
      
      const data = await response.json();
      return data.wishlist;
    } catch (error: any) {
      // Don't log 401 errors to reduce console noise
      if (!error.message?.includes('401') && !error.message?.includes('Unauthorized')) {
        console.error('Wishlist API error:', error);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Fetch wishlist from server
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      const data = await response.json();
      return data.wishlist;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    loadWishlist: (state) => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          state.items = JSON.parse(saved);
        }
      }
    },
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (!exists) {
        state.items.push(action.payload);
        saveToLocalStorage(state.items);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      saveToLocalStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      state.synced = false;
      saveToLocalStorage([]);
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId || item.product?.id,
          name: item.product?.name || item.productId?.name,
          slug: item.product?.slug || item.productId?.slug,
          image: item.product?.images?.[0] || item.productId?.images?.[0] || '',
          hoverImage: item.product?.images?.[1] || item.productId?.images?.[1] || null,
          price: item.product?.specialPrice || item.product?.originalPrice || item.productId?.specialPrice || item.productId?.originalPrice,
          originalPrice: item.product?.originalPrice || item.productId?.originalPrice,
          stock: item.product?.stock || item.productId?.stock,
        }));
        state.synced = true;
        saveToLocalStorage(state.items);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sync wishlist
    builder
      .addCase(syncWishlistWithServer.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncWishlistWithServer.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId._id || item.productId,
          name: item.productId.name,
          slug: item.productId.slug,
          image: item.productId.images?.[0] || '',
          price: item.productId.price,
          originalPrice: item.productId.originalPrice,
          stock: item.productId.stock,
        }));
        state.synced = true;
        saveToLocalStorage(state.items);
      })
      .addCase(syncWishlistWithServer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist async
    builder
      .addCase(addToWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId || item.product?.id,
          name: item.product?.name || item.productId?.name,
          slug: item.product?.slug || item.productId?.slug,
          image: item.product?.images?.[0] || item.productId?.images?.[0] || '',
          hoverImage: item.product?.images?.[1] || item.productId?.images?.[1] || null,
          price: item.product?.specialPrice || item.product?.originalPrice || item.productId?.specialPrice || item.productId?.originalPrice,
          originalPrice: item.product?.originalPrice || item.productId?.originalPrice,
          stock: item.product?.stock || item.productId?.stock,
        }));
        saveToLocalStorage(state.items);
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove from wishlist async
    builder
      .addCase(removeFromWishlistAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        const serverItems = action.payload.items || [];
        state.items = serverItems.map((item: any) => ({
          productId: item.productId || item.product?.id,
          name: item.product?.name || item.productId?.name,
          slug: item.product?.slug || item.productId?.slug,
          image: item.product?.images?.[0] || item.productId?.images?.[0] || '',
          hoverImage: item.product?.images?.[1] || item.productId?.images?.[1] || null,
          price: item.product?.specialPrice || item.product?.originalPrice || item.productId?.specialPrice || item.productId?.originalPrice,
          originalPrice: item.product?.originalPrice || item.productId?.originalPrice,
          stock: item.product?.stock || item.productId?.stock,
        }));
        saveToLocalStorage(state.items);
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  loadWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  clearWishlist 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
