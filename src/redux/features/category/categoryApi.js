import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/categories`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        fetchAllCategories: builder.query({
            query: () => "/",
            providesTags: ['Categories']
        }),
        addCategory: builder.mutation({
            query: (newCategory) => ({
                url: "/",
                method: "POST",
                body: newCategory
            }),
            invalidatesTags: ['Categories']
        }),
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ['Categories']
        })
    })
});

export const { 
    useFetchAllCategoriesQuery, 
    useAddCategoryMutation, 
    useDeleteCategoryMutation 
} = categoryApi;

export default categoryApi;