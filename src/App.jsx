import { Outlet, useLocation, useNavigate } from 'react-router-dom' 
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvide, useAuth } from './context/AuthContext' 
import { useEffect } from 'react' 

// Component nội bộ để truy cập context và router
const AppContent = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Nếu không loading, ĐÃ CÓ user, và đang ở trang login/register
    if (!loading && currentUser && (location.pathname === '/login' || location.pathname === '/register')) {
      // Tự động chuyển hướng về trang chủ
      console.log("User detected, navigating to home...");
      navigate('/');
    }
  }, [currentUser, loading, location, navigate]); // Chạy lại khi các giá trị này thay đổi

  return (
    <>
      <Navbar />
      <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-body'>
        {/* Outlet sẽ render các children: Home, Login, Register... */}
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <>
      {/* AuthProvide bọc AppContent */}
      <AuthProvide>
        <AppContent />
      </AuthProvide>
    </>
  ) 
}

export default App