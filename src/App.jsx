
import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AuthProvide } from './context/AuthContext'

function App() {

  return (
    <>
      <AuthProvide>
        <Navbar />
        {/* --- SỬA LẠI KHỐI MAIN --- */}
        <main className='min-h-screen max-w-screen-2xl mx-auto px-4 py-6 font-body'>
        {/* --- KẾT THÚC SỬA --- */}
          <Outlet />
        </main>
        <Footer />
      </AuthProvide>
    </>
  ) 
}

export default App