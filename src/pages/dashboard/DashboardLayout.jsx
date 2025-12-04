import React, { useState, useEffect } from 'react' 
import Loading from '../../components/Loading';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { HiViewGridAdd } from "react-icons/hi";
import { MdOutlineManageHistory } from "react-icons/md";
import { HiMiniChartBar, HiMiniFolder, HiMiniUserGroup, HiMiniArrowLeftOnRectangle } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5"; 
import { HiMegaphone } from "react-icons/hi2";
import { HiCog6Tooth } from "react-icons/hi2";
import { HiTag } from "react-icons/hi2";

const DashboardLayout = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Lấy Role và xử lý Redirect
  useEffect(() => {
    // --- SỬA: KIỂM TRA adminToken ---
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    
    if (!token || !storedUser) {
        // Chưa đăng nhập -> StaffRoute sẽ lo việc đá về login, 
        // nhưng ta cứ set loading false để render ra
        setLoading(false);
        return;
    }

    try {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role);
    } catch (error) {
        console.error("Error parsing user data:", error);
    }
    setLoading(false);
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (userRole === 'admin') navigate(`/dashboard/manage-books?q=${encodeURIComponent(searchQuery.trim())}`);
    else navigate(`/dashboard/orders?email=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery(""); 
  };
  
  const handleLogout = () => {
    // --- SỬA: XÓA adminToken ---
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser'); 
    if (userRole === 'employee') navigate("/employee");
    else navigate("/admin");
  }

  if (loading) return <Loading />;

  return (
    <section className="flex bg-paper min-h-screen font-body">
    
    {/* --- SIDEBAR --- */}
    <aside className="hidden sm:flex sm:flex-col w-64 bg-ink text-gray-300">
      {/* Logo Link: Admin về Dashboard, Employee về Orders */}
      <Link to={userRole === 'admin' ? "/dashboard" : "/dashboard/orders"} className="inline-flex items-center justify-center h-20 bg-primary/10">
        <img src="/fav-icon.png" alt="Logo" className="h-10 w-10" />
        <span className="text-xl text-white font-heading font-bold ml-2">Book Store</span>
      </Link>
      
      <div className="flex-grow flex flex-col justify-between">
        <nav className="flex flex-col p-4 space-y-2">
          
          {/* --- MENU DÀNH CHO ADMIN --- */}
          {userRole === 'admin' && (
            <>
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

              <Link to="/dashboard/manage-employees" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
                  <HiMiniUserGroup className="h-6 w-6"/>
                  <span className="font-medium">Manage Staff</span>
              </Link>
              <Link to="/dashboard/manage-banner" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
                  <HiMegaphone className="h-6 w-6"/>
                  <span className="font-medium">Manage Banner</span>
              </Link>
              <Link to="/dashboard/manage-settings" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
                  <HiCog6Tooth className="h-6 w-6"/>
                  <span className="font-medium">Store Settings</span>
              </Link>
              <Link to="/dashboard/manage-category" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
                  <HiTag className="h-6 w-6"/>
                  <span className="font-medium">Manage Categories</span>
              </Link>
            </>
          )}

          {/* --- MENU DÀNH CHO EMPLOYEE (Admin không thấy cái này nữa) --- */}
          {userRole === 'employee' && (
             <Link to="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-paper/10 rounded-lg">
                <HiMiniFolder className="h-6 w-6"/>
                <span className="font-medium">Manage Orders</span>
             </Link>
          )}

        </nav>
      </div>
    </aside>

    {/* --- MAIN CONTENT --- */}
    <div className="flex-grow text-ink">
      
      {/* HEADER */}
      <header className="flex items-center h-20 px-6 sm:px-10 bg-white border-b border-subtle">
        
        {/* THANH TÌM KIẾM (Hiển thị cho cả 2, nhưng placeholder khác nhau) */}
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <button type="submit" className="absolute h-6 w-6 top-3 left-3 text-gray-400 focus:outline-none">
                <IoSearchOutline className="h-5 w-5"/> 
            </button>
            <input 
                type="text" 
                role="search" 
                // Placeholder thay đổi theo Role
                placeholder={userRole === 'admin' ? "Search books..." : "Search orders by email..."} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-3 pl-11 pr-4 w-full border border-subtle placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary rounded-lg transition-all" 
            />
        </form>

        <div className="flex flex-shrink-0 items-center ml-auto">
          <div className="flex items-center gap-3 mr-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-ink capitalize">{userRole}</p>
             </div>
             <div className="h-10 w-10 bg-gray-100 rounded-full overflow-hidden border border-subtle">
                <img src="/fav-icon.png" alt="avatar" className="h-full w-full object-cover p-1.5" />
             </div>
          </div>
          <div className="border-l pl-3 space-x-1">
            <button onClick={handleLogout} title="Logout" className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-accent rounded-full transition-colors">
              <HiMiniArrowLeftOnRectangle className="h-6 w-6"/>
            </button>
          </div>
        </div>
      </header>
      
      {/* NỘI DUNG CHÍNH */}
      <main className="p-6 sm:p-10 space-y-6">
        {/* Chỉ Admin mới thấy Header "Dashboard" to đùng */}
        {userRole === 'admin' && location.pathname === '/dashboard' && (
             <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row justify-between animate-fade-in-down">
                <div className="mr-6">
                  <h1 className="text-4xl font-heading font-bold mb-2 text-primary">Dashboard</h1>
                  <h2 className="text-gray-500 ml-0.5">Book Store Inventory (SOA-132)</h2>
                </div>
                <div className="flex flex-col md:flex-row items-start justify-end -mb-3">
                  <Link to="/dashboard/manage-books" className="inline-flex px-5 py-3 text-primary border border-primary rounded-md mb-3 mr-4 hover:bg-primary hover:text-white transition-colors">
                      Manage Books
                  </Link>
                  <Link to="/dashboard/add-new-book" className="inline-flex px-5 py-3 text-white bg-primary rounded-md mb-3 hover:bg-opacity-90 transition-colors">
                      Add New Book
                  </Link>
                </div>
             </div>
        )}

       <Outlet/>
      </main>
    </div>
  </section>
  )
}

export default DashboardLayout