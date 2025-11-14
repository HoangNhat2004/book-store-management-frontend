import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Loading from '../components/Loading'; // <-- 1. IMPORT COMPONENT LOADING

const PrivateRoute = ({children}) => {
    const {currentUser, loading} = useAuth();

    if(loading) {
        // 2. SỬ DỤNG COMPONENT LOADING ĐÃ "LỘT XÁC"
        return <Loading /> 
    }
    if(currentUser) {
        return children;
    }
  
    return <Navigate to="/login" replace/>
}

export default PrivateRoute