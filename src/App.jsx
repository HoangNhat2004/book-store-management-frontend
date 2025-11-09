// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvide } from './context/AuthContext';
import { useEffect, useState } from 'react';
import Loading from './components/Loading';

// Import các trang
import AdminLogin from './components/AdminLogin';
import Orders from './pages/dashboard/Orders';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthProvide>
      <Navbar />
      <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary'>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-purple-700 mb-4">Book Store Management</h1>
              <p className="text-xl text-gray-600">Welcome to your admin dashboard</p>
              <a href="/admin-login" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go to Admin Login
              </a>
            </div>
          } />

          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Dashboard Orders */}
          <Route path="/dashboard/orders" element={<Orders />} />

          {/* 404 - Trang không tồn tại */}
          <Route path="*" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
              <p className="text-xl text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Go Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </AuthProvide>
  );
}

export default App;