import React from 'react'
import { FiShoppingCart } from 'react-icons/fi'
import { getImgUrl } from '../../utils/getImgUrl'
import { HiOutlineHeart, HiHeart } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { addToWishlist, removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice'
import { useAuth } from '../../context/AuthContext'
import { useAddToCartDBMutation, useGetCartQuery } from '../../redux/features/cart/cartApi'
import Swal from 'sweetalert2'

const BookCard = ({book}) => {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const [addToCartDB] = useAddToCartDBMutation();

    const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
    const isWishlisted = wishlistItems.some(item => item._id === book._id);

    // --- LOGIC LẤY SỐ LƯỢNG HIỆN CÓ ---
    const localCartItems = useSelector(state => state.cart.cartItems);
    // Lấy giỏ hàng DB nếu đã login
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
    // ----------------------------------
    
    const handleAddToCart = async (product) => {
        const currentQty = getCurrentQty();

        // 1. Kiểm tra phía Frontend (cho nhanh)
        if (currentQty + 1 > product.stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Out of Stock Limit',
                text: `You have ${currentQty} in cart. Max is ${product.stock}.`,
                showConfirmButton: false, timer: 2000
            });
            return;
        }

        if (currentUser) {
            try {
                await addToCartDB({ productId: product._id, quantity: 1 }).unwrap();
                Swal.fire({ position: 'top-end', icon: 'success', title: 'Added to Cart', showConfirmButton: false, timer: 1000 });
            } catch (error) {
                // 2. Bắt lỗi từ Backend trả về (Chốt chặn cuối cùng)
                const msg = error?.data?.message || "Failed to add to cart";
                Swal.fire('Limit Reached', msg, 'error');
            }
        } else {
            dispatch(addToCart(product))
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
    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-subtle overflow-hidden transition-shadow duration-300 hover:shadow-lg">
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

                <div className="flex items-center gap-3 mt-auto">
                    <button
                        onClick={() => handleAddToCart(book)}
                        disabled={book.stock <= 0}
                        className={`btn-primary w-full flex items-center justify-center gap-2 ${book.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <FiShoppingCart className="" />
                        <span>{book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                    </button>
                    <button
                        onClick={() => handleWishlistToggle(book)}
                        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        className={`p-3 border rounded-md transition-colors ${isWishlisted
                            ? 'text-accent border-accent-light bg-accent-light'
                            : 'text-gray-400 border-subtle hover:text-accent hover:border-accent-light'
                            }`}
                    >
                        {isWishlisted ? <HiHeart className="size-5" /> : <HiOutlineHeart className="size-5" />}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard