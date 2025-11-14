import axios from 'axios';
import React, { useState } from 'react' 

import Loading from '../../components/Loading';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";
// 1. IMPORT CÁC ICON MỚI
import { HiMiniChartBar, HiMiniFolder, HiMiniCog6Tooth, HiMiniArrowLeftOnRectangle } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5"; // <-- 2. THÊM DÒNG NÀY ĐỂ SỬA LỖI

const DashboardLayout = () => {
  
  const navigate = useNavigate()
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
    navigate("/admin") 
  }

  return (
    <section className="flex bg-paper min-h-screen font-body">
    
    {/* --- SIDEBAR --- */}
    <aside className="hidden sm:flex sm:flex-col w-64 bg-ink text-gray-300">
      <Link to="/dashboard" className="inline-flex items-center justify-center h-20 bg-primary/10">
        <img src="/fav-icon.png" alt="Logo" className="h-10 w-10" />
        <span className="text-xl text-white font-heading font-bold ml-2">Book Store</span>
      </Link>
      
      <div className="flex-grow flex flex-col justify-between">
        <nav className="flex flex-col p-4 space-y-2">
          
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
            <HiMiniChartBar className="h-6 w-6"/>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link to="/dashboard/add-new-book" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
            <HiViewGridAdd className="h-6 w-6"/>
            <span className="font-medium">Add Book</span>
          </Link>
          <Link to="/dashboard/manage-books" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
            <MdOutlineManageHistory className="h-6 w-6"/>
            <span className="font-medium">Manage Books</span>
          </Link>
          <Link 
            to="/dashboard/orders" 
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg"
          >
            <HiMiniFolder className="h-6 w-6"/>
            <span className="font-medium">Manage Orders</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-paper/10">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-paper/10 rounded-lg">
                <HiMiniCog6Tooth className="h-6 w-6"/>
                <span className="font-medium">View User Site</span>
            </a>
        </div>
      </div>
    </aside>

    {/* --- KHU VỰC NỘI DUNG CHÍNH --- */}
    <div className="flex-grow text-ink">
      
      {/* --- HEADER --- */}
      <header className="flex items-center h-20 px-6 sm:px-10 bg-white border-b border-subtle">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <button type="submit" className="absolute h-6 w-6 top-3 left-3 text-gray-400 focus:outline-none">
            {/* 3. Giờ icon này đã hợp lệ */}
            <IoSearchOutline className="h-5 w-5"/> 
          </button>
          <input 
            type="text" 
            role="search" 
            placeholder="Search books..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="py-3 pl-11 pr-4 w-full border border-subtle placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary rounded-lg" 
          />
        </form>

        <div className="flex flex-shrink-0 items-center ml-auto">
          <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden border border-subtle">
            <img
              src="/fav-icon.png"
              alt="admin avatar"
              className="h-full w-full object-cover p-1.5" 
            />
          </div>
          <div className="border-l pl-3 ml-3 space-x-1">
            <button
            onClick={handleLogout}
            title="Logout"
            className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-accent focus:bg-gray-100 focus:text-accent rounded-full">
              <span className="sr-only">Log out</span>
              <HiMiniArrowLeftOnRectangle className="h-6 w-6"/>
            </button>
          </div>
        </div>
      </header>
      
      {/* --- MAIN --- */}
      <main className="p-6 sm:p-10 space-y-6 ">
        
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between">
          <div className="mr-6">
            <h1 className="text-4xl font-heading font-bold mb-2 text-primary">Dashboard</h1>
            <h2 className="text-gray-500 ml-0.5">Book Store Inventory (SOA-132)</h2>
          </div>
          <div className="flex flex-col md:flex-row items-start justify-end -mb-3">
            <Link to="/dashboard/manage-books" className="inline-flex px-5 py-3 text-primary hover:text-primary-dark focus:text-primary-dark hover:bg-primary/10 focus:bg-primary/10 border border-primary rounded-md mb-3 transition-colors">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="flex-shrink-0 h-5 w-5 -ml-1 mt-0.5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Manage Books
            </Link>
            <Link to="/dashboard/add-new-book" className="inline-flex px-5 py-3 text-white bg-primary hover:bg-opacity-90 focus:bg-opacity-90 rounded-md ml-0 md:ml-6 mb-3 transition-colors shadow-sm">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="flex-shrink-0 h-6 w-6 text-white -ml-1 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Book
            </Link>
          </div>
        </div>

       <Outlet/>
      </main>
    </div>
  </section>
  )
}

export default DashboardLayout