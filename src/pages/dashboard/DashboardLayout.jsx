import axios from 'axios';
import React, { useState } from 'react' 

import Loading from '../../components/Loading';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";

const DashboardLayout = () => {
  
  const navigate = useNavigate()
  // State cho thanh tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/manage-books?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); 
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser'); 
    navigate("/admin") // Chuyển về trang login admin
  }

  return (
    <section className="flex md:bg-gray-100 min-h-screen overflow-hidden">
    <aside className="hidden sm:flex sm:flex-col">
      <a href="/" className="inline-flex items-center justify-center h-20 w-20 bg-purple-600 hover:bg-purple-500 focus:bg-purple-500">
        <img src="/fav-icon.png" alt="" />
      </a>
      <div className="flex-grow flex flex-col justify-between text-gray-500 bg-gray-800">
        <nav className="flex flex-col mx-4 my-6 space-y-4">
          
          {/* === Icon Folder (Thư mục) ĐÃ XÓA === */}
          
          <Link to="/dashboard" className="inline-flex items-center justify-center py-3 text-purple-600 bg-white rounded-lg">
            <span className="sr-only">Dashboard</span>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
          <Link to="/dashboard/add-new-book" className="inline-flex items-center justify-center py-3 hover:text-gray-400 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700 rounded-lg">
            <span className="sr-only">Add Book</span>
            <HiViewGridAdd className="h-6 w-6"/>
          </Link>
          <Link to="/dashboard/manage-books" className="inline-flex items-center justify-center py-3 hover:text-gray-400 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700 rounded-lg">
            <span className="sr-only">Documents</span>
            <MdOutlineManageHistory className="h-6 w-6"/>
          </Link>
          <Link 
            to="/dashboard/orders" 
            className="inline-flex items-center justify-center py-3 hover:text-gray-400 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700 rounded-lg"
          >
            <span className="sr-only">Orders</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </Link>
        </nav>
        
        {/* === Icon Settings (Cài đặt) ĐÃ XÓA === */}
        
      </div>
    </aside>
    <div className="flex-grow text-gray-800">
      <header className="flex items-center h-20 px-6 sm:px-10 bg-white">
        {/* ... (Thanh tìm kiếm giữ nguyên) ... */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md sm:-ml-2">
          <button type="submit" className="absolute h-6 w-6 mt-2.5 ml-2 text-gray-400 focus:outline-none">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
          <input 
            type="text" 
            role="search" 
            placeholder="Search books..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-2 pl-10 pr-4 w-full border-4 border-transparent placeholder-gray-400 focus:bg-gray-50 rounded-lg" 
          />
        </form>

        <div className="flex flex-shrink-0 items-center ml-auto">
          
          {/* --- THÊM AVATAR ADMIN --- */}
          <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden">
            <img
              src="/fav-icon.png"
              alt="admin avatar"
              className="h-full w-full object-cover p-2" 
            />
          </div>
          {/* --- KẾT THÚC AVATAR --- */}

          <div className="border-l pl-3 ml-3 space-x-1">
            
            {/* Nút Logout */}
            <button
            onClick={handleLogout}
            className="relative p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-100 focus:text-gray-600 rounded-full">
              <span className="sr-only">Log out</span>
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="p-6 sm:p-10 space-y-6 ">
       <Outlet/>
      </main>
    </div>
  </section>
  )
}

export default DashboardLayout