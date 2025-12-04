import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({children}) => {
  // --- SỬA: KIỂM TRA adminToken ---
  const token = localStorage.getItem('adminToken');
  const userString = localStorage.getItem('adminUser');
  const user = userString ? JSON.parse(userString) : null;

  if (!token) {
    return <Navigate to="/admin" replace/>
  }

  if (user && user.role === 'admin') {
      return children ? children : <Outlet/>;
  }

  // Nếu là Employee mà lạc vào route của Admin -> Về Orders
  return <Navigate to="/dashboard/orders" replace/>
}

export default AdminRoute;