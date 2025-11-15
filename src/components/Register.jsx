import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [message, setMessage] = useState("");
    const {registerUser, signInWithGoogle} = useAuth();
    const navigate = useNavigate(); 
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      const onSubmit = async(data) => {
        try {
            // --- SỬA LẠI: Tự động tạo email "giả" ---
            // Chúng ta gửi email giả vì UserDashboard của bạn cần email để hoạt động
            const fakeEmail = `${data.username}@bookstore.local`;
            await registerUser(data.username, fakeEmail, data.password);
            
            alert("User registered successfully! Please login.");
            navigate("/login"); // Chuyển hướng
        } catch (error) {
           const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
           if (errorMessage.includes("already exists")) {
               setMessage("Username or email already exists.");
           } else {
               setMessage(errorMessage);
           }
           console.error(error);
        }
      }

      const handleGoogleSignIn = async() => {
        try {
            await signInWithGoogle();
            // Không cần alert hay navigate ở đây
        } catch (error) {
            alert("Google sign in failed!") 
            console.error(error)
        }
      }

  return (
    <div className='h-[calc(100vh-120px)] flex justify-center items-center py-10'>
    <div className='w-full max-w-sm mx-auto bg-white shadow-lg border border-subtle rounded-lg px-8 pt-8 pb-8 mb-4'>
        <h2 className='text-3xl font-heading font-bold mb-6 text-center text-primary'>Register</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-4'>
                <label className='block text-ink text-sm font-bold mb-2' htmlFor="username">Username</label>
                <input 
                {...register("username", { required: true })} 
                type="text" name="username" id="username" placeholder='Username'
                className='shadow-inner appearance-none border border-subtle rounded-md w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                />
            </div>
            
            {/* --- ĐÃ XÓA TRƯỜNG EMAIL --- */}

            <div className='mb-6'>
                <label className='block text-ink text-sm font-bold mb-2' htmlFor="password">Password</label>
                <input 
                {...register("password", { required: true })} 
                type="password" name="password" id="password" placeholder='Password'
                className='shadow-inner appearance-none border border-subtle rounded-md w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                />
            </div>
            {
                message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
            }
            <div className='mb-4'>
                <button className='bg-primary text-white font-bold py-3 px-8 rounded-md w-full hover:bg-opacity-90 transition-opacity focus:outline-none shadow-sm'>Register</button>
            </div>
        </form>
        {/* Sửa link Login */}
        <p className='align-baseline font-medium mt-4 text-sm text-center text-ink'>
            Have an account? Please <Link to="/login" className='text-primary hover:text-opacity-80 font-bold'>Login</Link>
        </p>

        {/* google sign in */}
        <div className='mt-6'>
            {/* Sửa nút Google */}
            <button 
            onClick={handleGoogleSignIn}
            className='w-full flex flex-wrap gap-2 items-center justify-center bg-ink text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-opacity focus:outline-none shadow-sm'>
            <FaGoogle  className='mr-2'/>
            Sign in with Google
            </button>
        </div>

        {/* Sửa footer text */}
        <p className='mt-5 text-center text-ink/60 text-xs'>©2025 Book Store. All rights reserved.</p>
    </div>
</div>
  )
}

export default Register