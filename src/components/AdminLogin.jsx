// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import getBaseUrl from '../utils/baseURL';

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      // 1. Gửi thông tin đăng nhập lên backend
      const response = await fetch(`${getBaseUrl()}/api/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      // 2. Nếu backend báo lỗi (sai pass)
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // 3. Nếu thành công
      const { token, user } = result;

      localStorage.setItem('token', token);
      localStorage.setItem('adminUser', JSON.stringify(user));

      // TỰ ĐỘNG ĐĂNG XUẤT SAU 1 GIỜ (Giữ nguyên logic cũ)
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        alert('Session expired! Please login again.');
        navigate('/admin'); // Sửa thành /admin
      }, 3600 * 1000);

      alert("Admin Login successful!");
      navigate('/dashboard');

    } catch (error) {
      // 4. Hiển thị lỗi từ server (ví dụ: "Invalid username or password")
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen flex justify-center items-center'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
        <h2 className='text-xl font-semibold mb-4'>Admin Dashboard Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="username">
              Username
            </label>
            <input 
              {...register("username", { required: true })} 
              type="text" 
              placeholder='username'
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
            />
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">
              Password
            </label>
            <input 
              {...register("password", { required: true })} 
              type="password" 
              placeholder='Password'
              className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
            />
          </div>

          {message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>}

          <div className='w-full'>
            <button 
              type="submit"
              disabled={loading}
              className='bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none disabled:opacity-50'
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className='mt-5 text-center text-gray-500 text-xs'>©2025 Book Store. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;