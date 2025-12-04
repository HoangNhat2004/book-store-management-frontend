import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const StaffRoute = ({children}) => {
  const token = localStorage.getItem('adminToken');
  const userString = localStorage.getItem('adminUser');
  const user = userString ? JSON.parse(userString) : null;
  const location = useLocation();

  if (!token) {
    // Logic thông minh: Đang ở trang Orders hoặc Employee thì về Login Employee
    if (location.pathname.includes("orders") || location.pathname.includes("employee")) {
        return <Navigate to="/employee" replace/>
    }
    return <Navigate to="/admin" replace/>
  }

  // Nếu không phải Staff thì đá ra ngoài
  if (!user || (user.role !== 'admin' && user.role !== 'employee')) {
      return <Navigate to="/admin" replace/>
  }

  return children ? children : <Outlet/>;
}
export default StaffRoute