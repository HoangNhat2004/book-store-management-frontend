import React, { useState } from 'react'
import { useForm } from "react-hook-form"

import axios from "axios"
import getBaseUrl from '../utils/baseURL'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
    const [message, setMessage] = useState("")
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      const navigate = useNavigate()

      const onSubmit = async (data) => {
            try {
                const response = await axios.post(
                    `${getBaseUrl()}/api/auth/login`,  // ĐÚNG: /login
                    {
                        identifier: data.username,  // Gửi dưới dạng identifier
                        password: data.password
                    },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    }
                );

                const auth = response.data;

                if (auth.token && auth.user.role === "admin") {
                    localStorage.setItem('token', auth.token);
                    localStorage.setItem('adminUser', JSON.stringify(auth.user));

                    // Token hết hạn sau 1 giờ
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('adminUser');
                        alert('Token đã hết hạn! Vui lòng đăng nhập lại.');
                        navigate("/");
                    }, 3600 * 1000);

                    alert("Admin Login successful!");
                    navigate("/dashboard");
                } else {
                    setMessage("Bạn không có quyền admin!");
                }

            } catch (error) {
                console.error(error);
                setMessage("Sai tên đăng nhập hoặc mật khẩu");
            }
        };
  return (
    <div className='h-screen flex justify-center items-center '>
        <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
            <h2 className='text-xl font-semibold mb-4'>Admin Dashboard Login </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="username">Username</label>
                    <input 
                    {...register("username", { required: true })} 
                    type="text" name="username" id="username" placeholder='username'
                    className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">Password</label>
                    <input 
                    {...register("password", { required: true })} 
                    type="password" name="password" id="password" placeholder='Password'
                    className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                    />
                </div>
                {
                    message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
                }
                <div className='w-full'>
                    <button className='bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none'>Login </button>
                </div>
            </form>

            <p className='mt-5 text-center text-gray-500 text-xs'>©2025 Book Store. All rights reserved.</p>
        </div>
    </div>
  )
}

export default AdminLogin