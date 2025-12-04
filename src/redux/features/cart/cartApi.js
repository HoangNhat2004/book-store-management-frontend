// src/redux/features/cart/cartApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/cart`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('userToken');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Cart'],
    endpoints: (builder) => ({
        // 1. Lấy giỏ hàng từ DB
        getCart: builder.query({
            query: () => "/",
            providesTags: ['Cart']
        }),
        // 2. Thêm vào giỏ
        addToCartDB: builder.mutation({
            query: ({ productId, quantity }) => ({
                url: "/add",
                method: "POST",
                body: { productId, quantity }
            }),
            invalidatesTags: ['Cart']
        }),
        // 3. Cập nhật số lượng
        updateCartItemDB: builder.mutation({
            query: ({ productId, quantity }) => ({
                url: "/update",
                method: "PUT",
                body: { productId, quantity }
            }),
            invalidatesTags: ['Cart']
        }),
        // 4. Xóa giỏ hàng (nếu cần)
        clearCartDB: builder.mutation({
            query: () => ({
                url: "/clear",
                method: "DELETE"
            }),
            invalidatesTags: ['Cart']
        })
    })
});

export const { 
    useGetCartQuery, 
    useAddToCartDBMutation, 
    useUpdateCartItemDBMutation, 
    useClearCartDBMutation 
} = cartApi;

export default cartApi;