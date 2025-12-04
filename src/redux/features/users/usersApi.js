import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";

const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/auth`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('adminToken');
            if (token) headers.set('Authorization', `Bearer ${token}`);
            return headers;
        }
    }),
    tagTypes: ['Employees'],
    endpoints: (builder) => ({
        // Lấy danh sách nhân viên
        fetchEmployees: builder.query({
            query: () => "/employees",
            providesTags: ['Employees']
        }),
        // Thêm nhân viên
        addEmployee: builder.mutation({
            query: (newEmployee) => ({
                url: "/create-employee",
                method: "POST",
                body: newEmployee
            }),
            invalidatesTags: ['Employees']
        }),
        // Xóa nhân viên
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ['Employees']
        }),
        // THÊM MUTATION UPDATE
        updateEmployee: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/users/${id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: ['Employees']
        }),
    })
});

export const { useFetchEmployeesQuery, useAddEmployeeMutation, useDeleteUserMutation, useUpdateEmployeeMutation } = usersApi;
export default usersApi;