// src/redux/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";
import { auth } from "../../../firebase/firebase.config";

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: async (headers, { getState, endpoint }) => {
        
        // Lấy admin token (giữ nguyên cho các API admin)
        const token = localStorage.getItem('token');
        
        // Lấy Firebase token (cho các API user)
        const currentUser = auth.currentUser;
        
        if (currentUser && endpoint !== 'getOrders') {
            // Nếu là USER (đăng nhập Firebase) VÀ KHÔNG PHẢI gọi API getOrders (của admin)
            // Lấy ID token mới nhất của Firebase
            const idToken = await currentUser.getIdToken(true);
            headers.set('Authorization', `Bearer ${idToken}`);
        } else if (token && endpoint === 'getOrders') {
            // Nếu là ADMIN (có token) VÀ đang gọi API getOrders
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        return headers;
    },
    }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    // 1. Tạo đơn hàng
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/api/orders",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ['Orders'],
    }),

    // 2. Lấy đơn theo email (user)
    getOrderByEmail: builder.query({
      query: (email) => `/api/orders/email/${email}`,
      providesTags: ['Orders'],
    }),

    // 3. LẤY TẤT CẢ ĐƠN HÀNG (ADMIN) ← MỚI
    getOrders: builder.query({
      query: () => "/api/orders",
      providesTags: ['Orders'],
    }),
  }),
});

// XUẤT TẤT CẢ HOOK
export const { 
  useCreateOrderMutation, 
  useGetOrderByEmailQuery, 
  useGetOrdersQuery   // ← MỚI
} = ordersApi;

export default ordersApi;