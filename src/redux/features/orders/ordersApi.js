// src/redux/features/orders/ordersApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";
import { auth } from "../../../firebase/firebase.config"; 

const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: async (headers, { getState, endpoint }) => {
        // --- SỬA: LẤY adminToken ---
        const adminToken = localStorage.getItem('adminToken'); 
        const userToken = localStorage.getItem('userToken'); 
        const firebaseUser = auth.currentUser;
        
        // API dành cho Admin/Employee
        if (endpoint === 'getOrders' || endpoint === 'pushToGHN' || endpoint === 'getAllOrders') {
            if (adminToken) headers.set('Authorization', `Bearer ${adminToken}`);
        }
        // API dành cho Khách hàng
        else if (firebaseUser) {
             try {
                const idToken = await firebaseUser.getIdToken(); 
                localStorage.setItem('userToken', idToken);
                headers.set('Authorization', `Bearer ${idToken}`);
             } catch (error) { console.error("Failed to get token", error); }
        }
        else if (userToken) {
            headers.set('Authorization', `Bearer ${userToken}`);
        }
        
        return headers;
    },
  }),
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (newOrder) => ({
        url: "/api/orders",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ['Orders'],
    }),
    getOrderByEmail: builder.query({
      query: (email) => `/api/orders/email/${email}`,
      providesTags: ['Orders'],
    }),
    getOrders: builder.query({
      query: () => "/api/orders",
      providesTags: ['Orders'],
    }),
    confirmPayment: builder.mutation({
      query: (orderId) => ({
        url: `/api/orders/${orderId}/confirm-payment`,
        method: "POST",
      }),
      invalidatesTags: ['Orders'], 
    }),

    // --- THÊM MUTATION NÀY ---
    pushToGHN: builder.mutation({
        query: (orderId) => ({
            // Gọi sang route shipping
            url: `/api/shipping/create-order`, 
            method: "POST",
            body: { orderId }
        }),
        invalidatesTags: ['Orders']
    }),
    // -------------------------
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetOrderByEmailQuery, 
  useGetOrdersQuery,
  useConfirmPaymentMutation,
  usePushToGHNMutation // <-- Export ra để dùng bên Orders.jsx
} = ordersApi;

export default ordersApi;