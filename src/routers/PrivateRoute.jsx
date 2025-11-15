import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Loading from '../components/Loading'; 

const PrivateRoute = ({children}) => {
    const {currentUser, loading} = useAuth();
    
    // Lấy thêm token JWT (nếu có)
    const jwtToken = localStorage.getItem('userToken');

    if(loading) {
        return <Loading /> 
    }
    
    // Nếu có user Firebase (Google) HOẶC có JWT Token (Username/Pass)
    if(currentUser || jwtToken) {
        return children;
    }
  
    return <Navigate to="/login" replace/>
}

export default PrivateRoute