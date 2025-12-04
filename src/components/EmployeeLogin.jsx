import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';
import getBaseUrl from '../utils/baseURL';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const EmployeeLogin = () => {
    const [message, setMessage] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { logout } = useAuth(); // Lấy hàm logout

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${getBaseUrl()}/api/auth/employee-login`, data);
            const { token, user } = response.data;

            if (token) {
                // --- LƯU VÀO 'token' ---
                localStorage.setItem('adminToken', token);
                localStorage.setItem('adminUser', JSON.stringify(user));
                
                Swal.fire({title: "Success", text: "Welcome Employee!", icon: "success", timer: 1000, showConfirmButton: false});
                navigate("/dashboard/orders");
            }
        } catch (error) {
            alert("Login failed!");
        }
    }

    // ... (Phần return JSX giữ nguyên) ...
    return (
        // ... (Giữ nguyên giao diện) ...
        <div className='h-screen flex justify-center items-center bg-gray-100'>
            <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
                <h2 className='text-xl font-semibold mb-4'>Employee Portal Login</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Username Field */}
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="username">
                            Username
                        </label>
                        <input 
                            {...register("username", { required: true })} 
                            type="text" 
                            id="username" 
                            placeholder='Username'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                        {errors.username && <p className="text-red-500 text-xs italic">Username is required</p>}
                    </div>

                    {/* Password Field */}
                    <div className='mb-6'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">
                            Password
                        </label>
                        <input 
                            {...register("password", { required: true })} 
                            type="password" 
                            id="password" 
                            placeholder='Password'
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        />
                        {errors.password && <p className="text-red-500 text-xs italic">Password is required</p>}
                    </div>

                    {/* Hiển thị thông báo lỗi nếu có */}
                    {message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>}
                    
                    {/* Nút Login */}
                    <div className='flex items-center justify-between'>
                        <button 
                            type="submit"
                            className='bg-primary hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors'
                        >
                            Login
                        </button>
                    </div>
                </form>

                <p className='mt-5 text-center text-gray-500 text-xs'>
                    ©2025 Book Store Inventory. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default EmployeeLogin;