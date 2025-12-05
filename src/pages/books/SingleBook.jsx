import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { HiOutlineHeart, HiHeart } from 'react-icons/hi'
import { useParams } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useFetchBookByIdQuery } from '../../redux/features/books/booksApi';
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice';
import { getImgUrl } from '../../utils/getImgUrl';
import { useAuth } from '../../context/AuthContext';
import { useAddToCartDBMutation, useGetCartQuery } from '../../redux/features/cart/cartApi';
import Swal from 'sweetalert2';

const SingleBook = () => {
    const {id} = useParams();
    const {data: book, isLoading, isError} = useFetchBookByIdQuery(id);
    const dispatch =  useDispatch();
    const { currentUser } = useAuth();
    const [addToCartDB] = useAddToCartDBMutation();

    const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
    const isWishlisted = book ? wishlistItems.some(item => item._id === book._id) : false;

    // --- LẤY GIỎ HÀNG ĐỂ CHECK ---
    const localCartItems = useSelector(state => state.cart.cartItems);
    const { data: dbCart } = useGetCartQuery(undefined, { skip: !currentUser });

    const getCurrentQty = () => {
        if (currentUser && dbCart) {
            const item = dbCart.items.find(i => i.productId._id === book._id || i.productId === book._id);
            return item ? item.quantity : 0;
        } else {
            const item = localCartItems.find(i => i._id === book._id);
            return item ? item.quantity : 0;
        }
    }
    
    const handleAddToCart = async (product) => {
        const currentQty = getCurrentQty();

        if (currentQty + 1 > product.stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Limit Reached',
                text: `You already have ${currentQty}. Max is ${product.stock}.`,
                showConfirmButton: false, timer: 2000
            });
            return;
        }

        if (currentUser) {
            try {
                await addToCartDB({ productId: product._id, quantity: 1 }).unwrap();
                Swal.fire({ position: 'top-end', icon: 'success', title: 'Added to Cart', showConfirmButton: false, timer: 1000 });
            } catch (error) { 
                // Bắt lỗi từ backend nếu có
                Swal.fire('Limit Reached', error?.data?.message || 'Failed to add', 'error'); 
            }
        } else {
            dispatch(addToCart(product));
            Swal.fire({ position: 'top-end', icon: 'success', title: 'Added to Cart', showConfirmButton: false, timer: 1000 });
        }
    }

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
    <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
            
            <div className="w-full bg-white rounded-lg shadow-sm border border-subtle p-4">
                <img
                    src={getImgUrl(book.coverImage)}
                    alt={book.title}
                    className="w-full h-auto object-cover rounded-md"
                />
            </div>

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
                
                <div className="mb-4">
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold ${book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {book.stock > 0 ? `In Stock: ${book.stock}` : 'Out of Stock'}
                    </span>
                </div>

                <div className="border-t border-subtle pt-4 mb-6">
                    <p className="text-gray-600 mb-2"><strong>Author:</strong> {book.author || 'N/A'}</p>
                    <p className="text-gray-600 mb-2 capitalize">
                        <strong>Category:</strong> {book?.category?.name || book?.category || "Unknown"}
                    </p>
                    <p className="text-gray-600 mb-4">
                        <strong>Published:</strong> {new Date(book?.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <p className="text-ink/80 text-base font-body mb-8 leading-relaxed">{book.description}</p>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleAddToCart(book)} 
                        disabled={book.stock <= 0}
                        className={`btn-primary py-3 px-8 flex-grow flex items-center justify-center gap-2 ${book.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FiShoppingCart className="" />
                        <span>{book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
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
  )
}

export default SingleBook