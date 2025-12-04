import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const EmployeeRoute = ({children}) => {
  const token = localStorage.getItem('adminToken');
  const userString = localStorage.getItem('adminUser');
  const user = userString ? JSON.parse(userString) : null;

  if (!token) return <Navigate to="/employee" />

  // ADMIN KHÔNG ĐƯỢC VÀO ĐÂY -> VỀ DASHBOARD
  if (user && user.role === 'admin') {
      return <Navigate to="/dashboard" replace/>
  }

  return children ? children : <Outlet/>;
}
export default EmployeeRoute