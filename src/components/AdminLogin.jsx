// src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    // TÀI KHOẢN ADMIN DUY NHẤT (DEMO)
    if (data.username !== "admin" || data.password !== "admin123") {
      setMessage("Invalid username or password");
      setLoading(false);
      return;
    }

    try {
      // LẤY TOKEN TỪ BACKEND
      const response = await fetch('https://book-store-backend-97tz.onrender.com/api/admin-token');
      
      if (!response.ok) throw new Error('Failed to get token');

      const { token } = await response.json();

      // LƯU TOKEN + USER
      localStorage.setItem('token', token);
      localStorage.setItem('adminUser', JSON.stringify({
        name: 'Admin User',
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

      alert("Login successful!");
      navigate('/dashboard/orders');

    } catch (error) {
      console.error(error);
      setMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen flex justify-center items-center bg-gradient-to-br from-purple-50 to-blue-50'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-lg rounded-xl p-8'>
        <h2 className='text-2xl font-bold text-center text-purple-700 mb-6'>Admin Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Username</label>
            <input 
              {...register("username", { required: true })} 
              type="text" 
              placeholder='Enter "admin"'
              className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500'
            />
          </div>

          <div className='mb-6'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Password</label>
            <input 
              {...register("password", { required: true })} 
              type="password" 
              placeholder='Enter "admin123"'
              className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500'
            />
          </div>

          {message && (
            <p className='text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded'>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className='w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className='mt-4 text-center text-xs text-gray-500'>
          <p>Demo Account:</p>
          <p><strong>Username:</strong> admin</p>
          <p><strong>Password:</strong> admin123</p>
        </div>

        <p className='mt-6 text-center text-xs text-gray-500'>©2025 Book Store. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AdminLogin;