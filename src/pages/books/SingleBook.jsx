import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { HiOutlineHeart, HiHeart } from 'react-icons/hi'
import { useParams } from "react-router-dom"

import { getImgUrl } from '../../utils/getImgUrl';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice';
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

    if(isLoading) return <div>Loading...</div>
    if(isError) return <div>Error happending to load book info</div>
  return (
    <div className="max-w-lg shadow-md p-5">
            <h1 className="text-2xl font-bold mb-6">{book.title}</h1>

            <div className=''>
                <div>
                    <img
                        src={getImgUrl(book.coverImage)}
                        alt={book.title}
                        className="mb-8"
                    />
                </div>

                <div className='mb-5'>
                    <p className="text-gray-700 mb-2"><strong>Author:</strong> {book.author || 'admin'}</p>
                    <p className="text-gray-700 mb-4">
                        <strong>Published:</strong> {new Date(book?.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 mb-4 capitalize">
                        <strong>Category:</strong> {book?.category}
                    </p>
                    <p className="text-gray-700"><strong>Description:</strong> {book.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => handleAddToCart(book)} className="btn-primary px-6 space-x-1 flex items-center gap-1 ">
                        <FiShoppingCart className="" />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => handleWishlistToggle(book)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        // 7. Đổi màu và icon
                        className={`p-2 border rounded-full transition-colors ${
                            isWishlisted 
                            ? 'text-red-500 border-red-500' 
                            : 'text-gray-500 hover:text-red-500 hover:border-red-500'
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
  )
}

export default SingleBook