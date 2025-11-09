// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // DÙNG ROUTE TEST ĐÃ CÓ TRÊN RENDER
      const response = await fetch('https://book-store-backend-97tz.onrender.com/api/admin-token');
      
      if (!response.ok) throw new Error('Failed to get token');

      const { token } = await response.json();

      // LƯU TOKEN + GIẢ LẬP USER ADMIN
      localStorage.setItem('token', token);
      localStorage.setItem('adminUser', JSON.stringify({
        name: 'Admin',
        email: 'admin@example.com',
        role: 'admin'
      }));

      // TỰ ĐỘNG ĐĂNG XUẤT SAU 1 GIỜ
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        alert('Session expired! Please login again.');
        navigate('/admin-login');
      }, 3600 * 1000);

      alert("Admin Login successful!");
      navigate('/dashboard/orders');

    } catch (error) {
      console.error(error);
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <h2 className='text-xl font-semibold mb-4'>Admin Dashboard Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Username</label>
            <input 
              {...register("username", { required: true })} 
              type="text" 
              placeholder='Enter anything (demo)'
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
            />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
            <input 
              {...register("password", { required: true })} 
              type="password" 
              placeholder='Enter anything (demo)'
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
            />
          </div>

          {message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>}

          <div className='w-full'>
            <button 
              type="submit"
              className='bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none'
            >
              Login
            </button>
          </div>
        </form>

        <p className='mt-5 text-center text-gray-500 text-xs'>©2025 Book Store. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;