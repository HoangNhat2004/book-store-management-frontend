import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { getImgUrl } from '../../utils/getImgUrl';
import { useAuth } from '../../context/AuthContext';
import { useAddToCartDBMutation, useGetCartQuery } from '../../redux/features/cart/cartApi';
import Swal from 'sweetalert2';

const WishlistPage = () => {
    const { wishlistItems } = useSelector(state => state.wishlist);
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const [addToCartDB] = useAddToCartDBMutation();
    
    // Lấy giỏ hàng hiện tại để check số lượng (giống BookCard)
    const localCartItems = useSelector(state => state.cart.cartItems);
    const { data: dbCart } = useGetCartQuery(undefined, { skip: !currentUser });

    const getCurrentQty = (productId) => {
        if (currentUser && dbCart) {
            const item = dbCart.items.find(i => i.productId._id === productId || i.productId === productId);
            return item ? item.quantity : 0;
        } else {
            const item = localCartItems.find(i => i._id === productId);
            return item ? item.quantity : 0;
        }
    }

    const handleRemoveFromWishlist = (product) => {
        dispatch(removeFromWishlist(product));
    };

    const handleAddToCart = async (product) => {
        const currentQty = getCurrentQty(product._id);
        
        // 1. Kiểm tra Stock trước
        if (currentQty + 1 > product.stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Out of Stock Limit',
                text: `Cannot add more. You have ${currentQty}, only ${product.stock} available.`,
                showConfirmButton: false, timer: 2000
            });
            return;
        }

        // 2. Thêm vào giỏ
        if (currentUser) {
            try {
                await addToCartDB({ productId: product._id, quantity: 1 }).unwrap();
                Swal.fire({
                    position: 'top-end', icon: 'success', title: 'Added to Cart',
                    showConfirmButton: false, timer: 1000
                });
            } catch (error) {
                // Hiển thị lỗi chi tiết từ Backend
                const msg = error?.data?.message || 'Failed to add to cart';
                Swal.fire('Error', msg, 'error');
            }
        } else {
            dispatch(addToCart(product));
            Swal.fire({
                position: 'top-end', icon: 'success', title: 'Added to Cart',
                showConfirmButton: false, timer: 1000
            });
        }
    };

    return (
        <>
            <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-sm border border-subtle rounded-lg">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-2xl font-heading font-bold text-primary">My Wishlist</h2>
                    </div>

                    <div className="mt-8">
                        <div className="flow-root">
                            {wishlistItems.length > 0 ? (
                                <ul role="list" className="-my-6 divide-y divide-subtle">
                                    {wishlistItems.map((product) => (
                                        <li key={product?._id} className="flex py-6">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-subtle">
                                                <img
                                                    alt={product.title}
                                                    src={getImgUrl(product.coverImage)}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>

                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex flex-wrap justify-between text-base font-medium text-ink">
                                                        <h3>
                                                            <Link to={`/books/${product._id}`} className="font-heading hover:text-primary">{product?.title}</Link>
                                                        </h3>
                                                        <p className="sm:ml-4 font-heading">${product?.newPrice}</p>
                                                    </div>
                                                    
                                                    <p className="mt-1 text-sm text-gray-500 capitalize">
                                                        <strong>Category: </strong>
                                                        {product?.category?.name || product?.category || "Unknown"}
                                                    </p>
                                                </div>
                                                <div className="flex flex-1 flex-wrap items-center justify-between space-y-2 text-sm mt-4 gap-4">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        // Nếu hết hàng thì disable nút luôn cho chắc
                                                        disabled={product.stock <= 0}
                                                        type="button"
                                                        className={`font-medium ${product.stock <= 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-opacity-80'}`}
                                                    >
                                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveFromWishlist(product)}
                                                        type="button"
                                                        className="font-medium text-red-600 hover:text-red-500"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-10 text-lg">Your wishlist is empty!</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-subtle px-4 py-6 sm:px-6">
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <Link to="/">
                            <button
                                type="button"
                                className="font-medium text-primary hover:text-opacity-80 ml-1"
                            >
                                Continue Shopping
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WishlistPage;