import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../../redux/features/wishlist/wishlistSlice';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { getImgUrl } from '../../utils/getImgUrl';

const WishlistPage = () => {
    const { wishlistItems } = useSelector(state => state.wishlist);
    const dispatch = useDispatch();

    const handleRemoveFromWishlist = (product) => {
        dispatch(removeFromWishlist(product));
    };

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
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
                                                    src={getImgUrl(product.coverImage)} // Dùng getImgUrl
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
                                                    <p className="mt-1 text-sm text-gray-500 capitalize"><strong>Category: </strong>{product?.category}</p>
                                                </div>
                                                <div className="flex flex-1 flex-wrap items-center justify-between space-y-2 text-sm mt-4 gap-4">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        type="button"
                                                        className="font-medium text-primary hover:text-opacity-80"
                                                    >
                                                        Add to Cart
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