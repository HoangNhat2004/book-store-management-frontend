// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import Orders from './pages/dashboard/Orders';

function App() {
  return (
    <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary'>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Dashboard Orders */}
        <Route path="/dashboard/orders" element={<Orders />} />

        {/* Trang chủ tạm thời */}
        <Route path="*" element={
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-purple-700">Book Store Admin</h1>
            <a href="/admin-login" className="text-blue-600 underline mt-4 inline-block">Go to Login</a>
          </div>
        } />
      </Routes>
    </main>
  );
}

export default App;