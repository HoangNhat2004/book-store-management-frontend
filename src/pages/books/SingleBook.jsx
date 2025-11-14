import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { HiOutlineHeart, HiHeart } from 'react-icons/hi' // 1. Import icon đặc
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux'; // 2. Import useSelector
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
// 3. Import cả hai action
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice'; 
import { getImgUrl } from '../../utils/getImgUrl'; // (Vẫn dùng getImgUrl)

const SingleBook = () => {
    const {id} = useParams();
    const {data: book, isLoading, isError} = useFetchBookByIdQuery(id);
    const dispatch =  useDispatch();

    // 4. Lấy wishlist và kiểm tra
    const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
    const isWishlisted = book ? wishlistItems.some(item => item._id === book._id) : false;

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }

    // 5. Sửa thành hàm toggle
    const handleWishlistToggle = (product) => {
        if (isWishlisted) {
            dispatch(removeFromWishlist(product));
        } else {
            dispatch(addToWishlist(product));
        }
    }

    if(isLoading) return <div>Loading...</div> // (Sẽ thay bằng component Loading sau)
    if(isError) return <div>Error happending to load book info</div>
    
  return (
    // --- BẮT ĐẦU SỬA TOÀN BỘ JSX ---
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            
            {/* Cột 1: Ảnh Sách */}
            <div className="w-full bg-white rounded-lg shadow-sm border border-subtle p-4">
                <img
                    src={getImgUrl(book.coverImage)} // Dùng getImgUrl
                    alt={book.title}
                    className="w-full h-auto object-cover rounded-md"
                />
            </div>

            {/* Cột 2: Thông tin & Nút bấm */}
            <div className="flex flex-col">
                <h1 className="text-4xl font-heading font-bold text-ink mb-4">{book.title}</h1>
                
                <div className="mb-4">
                    <p className="text-2xl font-heading font-bold text-primary">
                        ${book?.newPrice}
                        <span className="text-lg line-through font-normal ml-3 text-gray-400">
                            ${book?.oldPrice}
                        </span>
                    </p>
                </div>

                <div className="border-t border-subtle pt-4 mb-6">
                    <p className="text-gray-600 mb-2"><strong>Author:</strong> {book.author || 'N/A'}</p>
                    <p className="text-gray-600 mb-2 capitalize">
                        <strong>Category:</strong> {book?.category}
                    </p>
                    <p className="text-gray-600 mb-4">
                        <strong>Published:</strong> {new Date(book?.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <p className="text-ink/80 text-base font-body mb-8 leading-relaxed">{book.description}</p>

                {/* Khối Nút Bấm */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleAddToCart(book)} 
                        className="btn-primary py-3 px-8 flex-grow flex items-center justify-center gap-2 ">
                        <FiShoppingCart className="" />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => handleWishlistToggle(book)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`p-4 border rounded-md transition-colors ${
                            isWishlisted 
                            ? 'text-accent border-accent-light bg-accent-light' 
                            : 'text-gray-400 border-subtle hover:text-accent hover:border-accent-light'
                        }`}
                    >
                        {isWishlisted ? (
                            <HiHeart className="size-6" />
                        ) : (
                            <HiOutlineHeart className="size-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
    // --- KẾT THÚC SỬA JSX ---
  )
}

export default SingleBook