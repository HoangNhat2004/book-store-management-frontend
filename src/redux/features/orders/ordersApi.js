// src/redux/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
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