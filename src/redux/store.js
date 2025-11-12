import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import booksApi from './features/books/booksApi'
import ordersApi from './features/orders/ordersApi'
import wishlistReducer from './features/wishlist/wishlistSlice' // <-- 1. IMPORT

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer, // <-- 2. THÊM VÀO
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(booksApi.middleware, ordersApi.middleware),
})