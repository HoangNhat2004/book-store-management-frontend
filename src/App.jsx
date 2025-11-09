// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import Orders from './pages/dashboard/Orders';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-primary'>
      <Routes>
        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Dashboard */}
        <Route
          path="/dashboard/orders"
          element={
            <DashboardLayout>
              <Orders />
            </DashboardLayout>
          }
        />

        {/* Trang chủ tạm thời */}
        <Route path="*" element={
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold">Book Store Admin</h1>
            <a href="/admin-login" className="text-blue-600 underline">Go to Login</a>
          </div>
        } />
      </Routes>
    </main>
  );
}

export default App;