import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/settings`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        fetchSettings: builder.query({
            query: () => "/",
            providesTags: ['Settings']
        }),
        updateSettings: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "PUT",
                body: data
            }),
            invalidatesTags: ['Settings']
        })
    })
});

export const { useFetchSettingsQuery, useUpdateSettingsMutation } = settingsApi;
export default settingsApi;