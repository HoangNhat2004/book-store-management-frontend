// src/redux/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";
import { auth } from "../../../firebase/firebase.config"; 

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: async (headers, { getState, endpoint }) => {
        
        const adminToken = localStorage.getItem('token'); // Token của Admin
        const userToken = localStorage.getItem('userToken'); // Token của User (JWT)
        const firebaseUser = auth.currentUser;
        
        if (endpoint === 'getOrders') {
            // ADMIN API: Dùng Admin Token
            if (adminToken) headers.set('Authorization', `Bearer ${adminToken}`);
        }
        else if (userToken) {
            // USER API (JWT): Dùng User Token
            headers.set('Authorization', `Bearer ${userToken}`);
        }
        else if (firebaseUser) {
             // USER API (FIREBASE): Dùng Firebase Token
             
             // --- BẮT ĐẦU SỬA ---
             // Xóa 'true' để dùng token đã cache, tránh lỗi quota
            const idToken = await firebaseUser.getIdToken(); 
            // --- KẾT THÚC SỬA ---
            
            headers.set('Authorization', `Bearer ${idToken}`);
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

    // 3. LẤY TẤT CẢ ĐƠN HÀNG (ADMIN)
    getOrders: builder.query({
      query: () => "/api/orders",
      providesTags: ['Orders'],
    }),

    // 4. Xác nhận thanh toán
    confirmPayment: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/confirm-payment`,
        method: "POST",
      }),
      invalidatesTags: ['Orders'], 
    }),
  }),
});

// XUẤT TẤT CẢ HOOK
export const { 
  useCreateOrderMutation, 
  useGetOrderByEmailQuery, 
  useGetOrdersQuery,
  useConfirmPaymentMutation 
} = ordersApi;

export default ordersApi;