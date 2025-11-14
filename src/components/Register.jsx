import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Import useNavigate
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import { useAuth } from '../context/AuthContext';

const Register = () => {
    // --- TOÀN BỘ LOGIC JAVASCRIPT GIỮ NGUYÊN ---
    const [message, setMessage] = useState("");
    const {registerUser, signInWithGoogle} = useAuth();
    const navigate = useNavigate(); // Khởi tạo navigate
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      const onSubmit = async(data) => {
        try {
            await registerUser(data.email, data.password);
            alert("User registered successfully! Please login.");
            navigate("/login"); // Chuyển hướng
        } catch (error) {
           setMessage("Please provide a valid email and password") 
           console.error(error)
        }
      }

      const handleGoogleSignIn = async() => {
        try {
            await signInWithGoogle();
            alert("Login successful!");
            navigate("/")
        } catch (error) {
            alert("Google sign in failed!") 
            console.error(error)
        }
      }
    // --- KẾT THÚC LOGIC JAVASCRIPT ---

  return (
    // --- BẮT ĐẦU SỬA GIAO DIỆN (UI) ---
    <div className='h-[calc(100vh-120px)] flex justify-center items-center py-10'>
    {/* Sửa lại thẻ Card */}
    <div className='w-full max-w-sm mx-auto bg-white shadow-lg border border-subtle rounded-lg px-8 pt-8 pb-8 mb-4'>
        <h2 className='text-3xl font-heading font-bold mb-6 text-center text-primary'>Register</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
            <div className='mb-4'>
                <label className='block text-ink text-sm font-bold mb-2' htmlFor="email">Email</label>
                <input 
                {...register("email", { required: true })} 
                type="email" name="email" id="email" placeholder='Email Address'
                // Sửa style input
                className='shadow-inner appearance-none border border-subtle rounded-md w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                />
            </div>
            <div className='mb-6'>
                <label className='block text-ink text-sm font-bold mb-2' htmlFor="password">Password</label>
                <input 
                {...register("password", { required: true })} 
                type="password" name="password" id="password" placeholder='Password'
                // Sửa style input
                className='shadow-inner appearance-none border border-subtle rounded-md w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                />
            </div>
            {
                message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
            }
            <div className='mb-4'>
                {/* Sửa nút Register */}
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