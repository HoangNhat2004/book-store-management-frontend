import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { getImgUrl } from '../../utils/getImgUrl'
import { HiOutlineHeart, HiHeart } from 'react-icons/hi'

import { Link } from'react-router-dom'

import { useDispatch, useSelector } from'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice'

const BookCard = ({book}) => {
    const dispatch =  useDispatch();

    // 4. Lấy wishlist từ Redux
    const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
    // 5. Kiểm tra xem sách này đã có trong wishlist chưa
    const isWishlisted = wishlistItems.some(item => item._id === book._id);

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }

    const handleWishlistToggle = (product) => {
        if (isWishlisted) {
            dispatch(removeFromWishlist(product)); // Nếu đã có -> Xóa
        } else {
            dispatch(addToWishlist(product)); // Nếu chưa có -> Thêm
        }
    }
    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-subtle overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            {/* Vùng ảnh */}
            <div className="flex-shrink-0">
                <Link to={`/books/${book._id}`} className="block relative group">
                    <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden">
                         <img
                            src={getImgUrl(book?.coverImage)}
                            alt={book?.title}
                            className="w-full h-full object-cover object-center p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
            </div>

            {/* Vùng nội dung */}
            <div className="flex flex-col flex-grow p-5 pt-0">
                <Link to={`/books/${book._id}`}>
                    <h3 className="text-lg font-heading font-bold text-ink hover:text-primary mb-1 truncate">
                        {book?.title}
                    </h3>
                </Link>
                <p className="text-gray-500 text-sm mb-3 flex-grow">
                    {book?.description.length > 70 ? `${book.description.slice(0, 70)}...` : book?.description}
                </p>
                <p className="font-semibold text-xl text-primary mb-4">
                    ${book?.newPrice} <span className="text-base line-through font-normal ml-2 text-gray-400">$ {book?.oldPrice}</span>
                </p>

                {/* Vùng nút bấm */}
                <div className="flex items-center gap-3 mt-auto">
                    <button
                        onClick={() => handleAddToCart(book)}
                        className="btn-primary w-full flex items-center justify-center gap-2">
                        <FiShoppingCart className="" />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => handleWishlistToggle(book)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`p-3 border rounded-md transition-colors ${isWishlisted
                            ? 'text-accent border-accent-light bg-accent-light'
                            : 'text-gray-400 border-subtle hover:text-accent hover:border-accent-light'
                            }`}
                    >
                        {isWishlisted ? (
                            <HiHeart className="size-5" />
                        ) : (
                            <HiOutlineHeart className="size-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard