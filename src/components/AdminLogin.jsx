import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import getBaseUrl from '../utils/baseURL';
// KHÔNG import useAuth để tránh xung đột session

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const { token, user } = result;

      // --- SỬA: LƯU VÀO adminToken ---
      localStorage.setItem('adminToken', token); 
      localStorage.setItem('adminUser', JSON.stringify(user));

      setTimeout(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        alert('Session expired! Please login again.');
        navigate('/admin'); 
      }, 3600 * 1000);

      alert("Admin Login successful!");
      navigate('/dashboard');

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-screen flex justify-center items-center bg-paper'>
      <div className='w-full max-w-sm mx-auto bg-white shadow-lg border border-subtle rounded-lg px-8 pt-6 pb-8 mb-4'>
        <h2 className='text-3xl font-heading font-bold mb-6 text-center text-primary'>Admin Login</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='mb-4'>
            <label className='block text-ink text-sm font-bold mb-2' htmlFor="username">
              Username
            </label>
            <input 
              {...register("username", { required: true })} 
              type="text" 
              placeholder='username'
              className='shadow appearance-none border border-subtle rounded w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
            />
          </div>

          <div className='mb-6'>
            <label className='block text-ink text-sm font-bold mb-2' htmlFor="password">
              Password
            </label>
            <input 
              {...register("password", { required: true })} 
              type="password" 
              placeholder='Password'
              className='shadow appearance-none border border-subtle rounded w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
            />
          </div>

          {message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>}

          <div className='w-full'>
            <button 
              type="submit"
              disabled={loading}
              className='bg-primary w-full text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-opacity focus:outline-none disabled:opacity-50'
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;