import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';

const CartPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch =  useDispatch()

    const hasItems = cartItems.length > 0;

    const totalPrice =  cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0).toFixed(2);

    const handleRemoveFromCart = (product) => {
        dispatch(removeFromCart(product))
    }

    const handleClearCart  = () => {
        dispatch(clearCart())
    }

    const handleIncreaseQuantity = (product) => {
        // Lấy số lượng hiện tại (hoặc 1 nếu chưa có) và cộng thêm 1
        const newQuantity = (product.quantity || 1) + 1;
        // Dispatch action updateQuantity đã import
        dispatch(updateQuantity({ _id: product._id, quantity: newQuantity }));
    };

    const handleDecreaseQuantity = (product) => {
        // Lấy số lượng hiện tại (hoặc 1) và trừ đi 1
        const newQuantity = (product.quantity || 1) - 1;
        if (newQuantity > 0) {
            // Nếu vẫn còn, chỉ cập nhật
            dispatch(updateQuantity({ _id: product._id, quantity: newQuantity }));
        } else {
            // Nếu về 0, xóa sản phẩm khỏi giỏ hàng
            dispatch(removeFromCart(product));
        }
    };
    return (
        <>
            <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-sm border border-subtle rounded-lg">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div className="flex items-start justify-between">
                        <h2 className="text-2xl font-heading font-bold text-primary">Shopping cart</h2>
                        <div className="ml-3 flex h-7 items-center ">
                            {hasItems && ( // Chỉ hiển thị nút Clear nếu có hàng
                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    className="relative -m-2 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200"
                                >
                                    <span className="font-medium">Clear Cart</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flow-root">
                            {
                                hasItems ? (
                                    <ul role="list" className="-my-6 divide-y divide-subtle">
                                        {
                                            cartItems.map((product) => (
                                                <li key={product?._id} className="flex py-6">
                                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-subtle">
                                                        <img
                                                            alt={product?.title}
                                                            src={`${getImgUrl(product?.coverImage)}`}
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
                                                        <div className="flex flex-1 flex-wrap items-end justify-between space-y-2 text-sm">
                                                            {/* Sửa lại Qty */}
                                                            <div className="flex items-center border border-subtle rounded">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDecreaseQuantity(product)}
                                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-10 text-center font-medium text-ink">
                                                                    {product.quantity || 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleIncreaseQuantity(product)}
                                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            <div className="flex">
                                                                <button
                                                                onClick={() => handleRemoveFromCart(product)}
                                                                type="button" className="font-medium text-red-600 hover:text-red-500">
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                ) : (<p className="text-center text-gray-500 py-10 text-lg">Your cart is empty!</p>)
                            }
                        </div>
                    </div>
                </div>

                <div className="border-t border-subtle px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-base font-medium text-ink">
                        <p className="font-heading">Subtotal</p>
                        <p className="font-heading">${totalPrice ? totalPrice : 0}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                    <div className="mt-6">
                        <Link
                            to={hasItems ? "/checkout" : "#"}
                            onClick={(e) => !hasItems && e.preventDefault()}
                            // Sửa lại nút Checkout
                            className={`flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${
                                hasItems 
                                ? 'bg-accent hover:bg-opacity-90 cursor-pointer' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Checkout
                        </Link>
                    </div>
                    <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <Link to="/">
                            or
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
    )
}

export default CartPage