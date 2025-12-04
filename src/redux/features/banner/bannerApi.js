import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const bannerApi = createApi({
    reducerPath: 'bannerApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/banner`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Banner'],
    endpoints: (builder) => ({
        fetchBanner: builder.query({
            query: () => "/",
            providesTags: ['Banner']
        }),
        updateBanner: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "PUT",
                body: data
            }),
            invalidatesTags: ['Banner']
        }),
        uploadImage: builder.mutation({
            query: (formData) => ({
                url: "/api/upload", // Gọi sang route upload bên backend
                method: "POST",
                body: formData,
            }),
        })
    })
});

export const { useFetchBannerQuery, useUpdateBannerMutation, useUploadImageMutation } = bannerApi;
export default bannerApi;