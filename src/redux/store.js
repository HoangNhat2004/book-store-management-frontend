import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import booksApi from './features/books/booksApi'
import ordersApi from './features/orders/ordersApi'
import wishlistReducer from './features/wishlist/wishlistSlice'
import usersApi from './features/users/usersApi' // <-- 1. Import mới
import bannerApi from './features/banner/bannerApi';
import settingsApi from './features/settings/settingsApi';
import cartApi from './features/cart/cartApi'
import categoryApi from './features/category/categoryApi';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer, // <-- 2. Thêm reducer
    [bannerApi.reducerPath]: bannerApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(booksApi.middleware, ordersApi.middleware, usersApi.middleware, bannerApi.middleware, settingsApi.middleware, cartApi.middleware, categoryApi.middleware),
})