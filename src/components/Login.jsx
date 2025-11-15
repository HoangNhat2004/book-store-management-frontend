import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [message, setMessage] = useState("")
    const { loginUser, signInWithGoogle} = useAuth();
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm()

      const onSubmit = async (data) => {
        try {
            await loginUser(data.identifier, data.password);
            alert("Login successful!");
            navigate("/")
        } catch (error) {
            setMessage("Please provide a valid email and password") 
            console.error(error)
        }
      }

      const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            alert("Login successful!");
            navigate("/")
        } catch (error) {
            alert("Google sign in failed!") 
            console.error(error)
        }
      }
  return (
    <div className='h-[calc(100vh-120px)] flex justify-center items-center '>
        {/* Sửa lại thẻ Card */}
        <div className='w-full max-w-sm mx-auto bg-white shadow-lg border border-subtle rounded-lg px-8 pt-6 pb-8 mb-4'>
            <h2 className='text-3xl font-heading font-bold mb-6 text-center text-primary'>Login</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-4'>
                    <label className='block text-ink text-sm font-bold mb-2' htmlFor="identifier">Username or Email</label>
                    <input 
                    {...register("identifier", { required: true })} 
                    type="text" name="identifier" id="identifier" placeholder='Username or Email'
                    className='shadow-inner appearance-none border border-subtle rounded-md w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                    />
                </div>
                <div className='mb-6'>
                    <label className='block text-ink text-sm font-bold mb-2' htmlFor="password">Password</label>
                    <input 
                    {...register("password", { required: true })} 
                    type="password" name="password" id="password" placeholder='Password'
                    className='shadow appearance-none border border-subtle rounded w-full py-3 px-4 text-ink leading-tight focus:outline-none focus:ring-1 focus:ring-accent'
                    />
                </div>
                {
                    message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
                }
                <div className='mb-4'>
                    {/* Sửa nút Login */}
                    <button className='bg-primary text-white font-bold py-3 px-8 rounded-md w-full hover:bg-opacity-90 transition-opacity focus:outline-none'>Login</button>
                </div>
            </form>
            <p className='align-baseline font-medium mt-4 text-sm text-center text-ink'>
                Haven't an account? Please <Link to="/register" className='text-primary hover:text-opacity-80 font-bold'>Register</Link>
            </p>

            {/* google sign in */}
            <div className='mt-6'>
                 {/* Sửa nút Google */}
                <button 
                onClick={handleGoogleSignIn}
                className='w-full flex flex-wrap gap-1 items-center justify-center bg-ink text-white font-bold py-3 px-4 rounded-md hover:bg-opacity-90 transition-opacity focus:outline-none'>
                <FaGoogle  className='mr-2'/>
                Sign in with Google
                </button>
            </div>
        </div>
    </div>
  )
}

export default Login