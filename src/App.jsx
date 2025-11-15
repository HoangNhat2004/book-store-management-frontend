import { Outlet, useLocation, useNavigate } from 'react-router-dom' // 1. Thêm useLocation, useNavigate
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvide, useAuth } from './context/AuthContext' // 2. Import useAuth
import { useEffect } from 'react' // 3. Thêm useEffect

// 4. Tách AppContent để có thể sử dụng context
const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Nếu đã tải xong, có người dùng, và đang ở trang login/register
    if (!loading && currentUser && (location.pathname === '/login' || location.pathname === '/register')) {
      // Tự động chuyển hướng về trang chủ
      console.log("User detected, navigating to home...");
      navigate('/');
    }
  }, [currentUser, loading, location, navigate]);

  return (
    <>
      <Navbar />
      <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-body'>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

// 5. Sửa lại hàm App chính
function App() {

  return (
    <>
      <AuthProvide>
        {/* Render AppContent bên trong AuthProvide */}
        <AppContent />
      </AuthProvide>
    </>
  ) 
}

export default App