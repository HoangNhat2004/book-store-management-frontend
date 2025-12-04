import { Link, useNavigate } from "react-router-dom";
import { HiMiniBars3CenterLeft, HiOutlineHeart, HiOutlineShoppingCart } from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { HiOutlineUser } from "react-icons/hi";

import avatarImg from "../assets/avatar.png"
import { useState } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
// Import API để lấy giỏ hàng DB
import { useGetCartQuery } from '../redux/features/cart/cartApi';

// --- ĐÃ CẬP NHẬT NAVIGATION THEO Ý BẠN ---
const navigation = [
    {name: "Dashboard", href:"/user-dashboard"},
    {name: "Orders", href:"/orders"},
    {name: "Cart Page", href:"/cart"},
]
// -----------------------------------------

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const { wishlistItems } = useSelector(state => state.wishlist);
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()
    
    // --- LOGIC ĐẾM SỐ LƯỢNG GIỎ HÀNG ---
    const localCartItems = useSelector(state => state.cart.cartItems);
    const { data: dbCart } = useGetCartQuery(undefined, { skip: !currentUser });

    const cartItemCount = currentUser 
        ? (dbCart?.items?.reduce((total, item) => total + item.quantity, 0) || 0)
        : (localCartItems.reduce((total, item) => total + item.quantity, 0) || 0);
    // -----------------------------------

    const handleLogOut = () => {
        logout()
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery("")
        }
    }
  
    return (
        <header className="max-w-screen-2xl mx-auto px-4 py-6 border-b border-subtle"> 
            <nav className="flex justify-between items-center">
                {/* left side */}
                <div className="flex items-center md:gap-16 gap-4">
                    <Link to="/">
                        <HiMiniBars3CenterLeft className="size-6 text-ink" />
                    </Link>

                    {/* search input */}
                    <div className="relative sm:w-72 w-40 space-x-2">
                        <form onSubmit={handleSearch}>
                            <IoSearchOutline className="absolute inline-block left-3 inset-y-2 cursor-pointer text-gray-500" 
                                onClick={handleSearch}
                            />
                            <input 
                                type="text" 
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border border-subtle w-full py-2 md:px-10 px-10 rounded-full focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                        </form>
                    </div>
                </div>

                {/* right side */}
                <div className="relative flex items-center md:space-x-3 space-x-2">
                    <div >
                        {
                            currentUser ? (
                                <>
                                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <img 
                                        src={currentUser?.photoURL || avatarImg} 
                                        alt="User avatar" 
                                        className={`size-8 rounded-full ${currentUser ? 'ring-2 ring-accent' : ''}`} 
                                    />
                                </button>
                                {/* show dropdowns */}
                                {
                                    isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                                            <ul className="py-2">
                                                {
                                                    navigation.map((item) => (
                                                        <li key={item.name} onClick={() => setIsDropdownOpen(false)}>
                                                            <Link to={item.href} className="block px-4 py-2 text-sm hover:bg-gray-100">
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))
                                                }
                                                <li>
                                                    <button
                                                    onClick={handleLogOut}
                                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )
                                }
                                </> 
                            ) : (
                                <Link to="/login"> <HiOutlineUser className="size-6 text-ink" /></Link>
                            )
                        }
                    </div>
                    
                    <Link to="/wishlist" className="hidden sm:block relative p-1">
                        <HiOutlineHeart className="size-6 text-ink hover:text-accent" />
                        {wishlistItems && wishlistItems.length > 0 && (
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-accent text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                                {wishlistItems.length}
                            </span>
                        )}
                    </Link>

                    <Link to="/cart" className="bg-accent p-1 sm:px-6 px-3 flex items-center rounded-full text-white">
                        <HiOutlineShoppingCart className='size-5' />
                        {
                            cartItemCount > 0 ?  <span className="text-sm font-semibold sm:ml-2">{cartItemCount}</span> :  <span className="text-sm font-semibold sm:ml-2">0</span>
                        }
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Navbar;