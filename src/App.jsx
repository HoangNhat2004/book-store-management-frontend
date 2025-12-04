import { Outlet, useLocation, useNavigate } from 'react-router-dom' 
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
// Chỉ import useAuth để dùng, KHÔNG import AuthProvide nữa (vì đã có ở main.jsx)
import { useAuth } from './context/AuthContext' 
import { useEffect } from 'react' 

function App() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Logic: Nếu đã đăng nhập mà cố vào trang login/register -> Đá về trang chủ
    if (!loading && currentUser && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/');
    }
  }, [currentUser, loading, location, navigate]);

  return (
    <>
      <Navbar />
      <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-body'>
        {/* Outlet sẽ hiển thị các trang con như Home, Cart, Checkout... */}
        <Outlet />
      </main>
      <Footer />
    </>
  ) 
}

export default App