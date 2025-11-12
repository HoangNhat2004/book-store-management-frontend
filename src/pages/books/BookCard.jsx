import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { getImgUrl } from '../../utils/getImgUrl'
import { HiOutlineHeart } from 'react-icons/hi'

import { Link } from'react-router-dom'

import { useDispatch } from'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { addToWishlist } from '../../redux/features/wishlist/wishlistSlice'

const BookCard = ({book}) => {
    const dispatch =  useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product))
    }

    // <-- 3. THÊM HANDLER
    const handleAddToWishlist = (product) => {
        dispatch(addToWishlist(product))
    }
    return (
        <div className=" rounded-lg transition-shadow duration-300">
            <div
                className="flex flex-col sm:flex-row sm:items-center sm:h-72  sm:justify-center gap-4"
            >
                <div className="sm:h-72 sm:flex-shrink-0 border rounded-md">
                    <Link to={`/books/${book._id}`}>
                        <img
                            src={`${getImgUrl(book?.coverImage)}`}
                            alt=""
                            className="w-full bg-cover p-2 rounded-md cursor-pointer hover:scale-105 transition-all duration-200"
                        />
                    </Link>
                </div>

                <div>
                    <Link to={`/books/${book._id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-3">
                       {book?.title}
                        </h3>
                    </Link>
                    <p className="text-gray-600 mb-5">{book?.description.length > 80 ? `${book.description.slice(0, 80)}...` : book?.description}</p>
                    <p className="font-medium mb-5">
                        ${book?.newPrice} <span className="line-through font-normal ml-2">$ {book?.oldPrice}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button 
                        onClick={() => handleAddToCart(book)}
                        className="btn-primary px-6 space-x-1 flex items-center gap-1 ">
                            <FiShoppingCart className="" />
                            <span>Add to Cart</span>
                        </button>
                        <button
                            onClick={() => handleAddToWishlist(book)}
                            title="Add to Wishlist"
                            className="p-2 text-gray-500 hover:text-red-500 border rounded-full hover:border-red-500 transition-colors"
                        >
                            <HiOutlineHeart className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookCard