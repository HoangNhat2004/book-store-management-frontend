import React, { useState, useEffect, useCallback } from 'react' // 1. ĐÃ THÊM useCallback
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { clearCart } from '../../redux/features/cart/cartSlice';
import axios from 'axios'; 
import getBaseUrl from '../../utils/baseURL'; 
import Loading from '../../components/Loading'; 

// Tỷ giá (chỉ để hiển thị cho frontend)
const EXCHANGE_RATE_USD_TO_VND = 25000;

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const { currentUser } = useAuth()
    const {
        register,
        handleSubmit,
        watch, // Giữ watch
        formState: { errors },
    } = useForm()

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hasItems = cartItems.length > 0; 
    
    // --- BẮT ĐẦU KHỐI STATE (ĐÃ GHÉP) ---
    const [orderPlaced, setOrderPlaced] = useState(false); // (Từ code cũ - sửa lỗi COD)
    const [isChecked, setIsChecked] = useState(false)
    const [shippingFee, setShippingFee] = useState(0); // (Từ code mới - GHTK)
    const [isCalculatingFee, setIsCalculatingFee] = useState(false); // (Từ code mới - GHTK)
    const [paymentMethod, setPaymentMethod] = useState('cod'); 
    // --- KẾT THÚC KHỐI STATE ---

    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    const totalOrderPriceUSD = (Number(subtotal) + Number(shippingFee)); 

    // --- LOGIC TÍNH PHÍ GHTK (Từ code mới) ---
    const calculateFee = useCallback(async (address) => {
        setIsCalculatingFee(true);
        try {
            const response = await axios.post(`${getBaseUrl()}/api/shipping/calculate-fee`, {
                address: address
            });
            
            const feeInUSD = (response.data.shippingFee || 0) / EXCHANGE_RATE_USD_TO_VND;
            
            setShippingFee(feeInUSD);
        } catch (error) {
            console.error("Error calculating shipping fee", error);
            setShippingFee(0); 
        } finally {
            setIsCalculatingFee(false);
        }
    }, []); 

    const city = watch("city");
    const state = watch("state");
    const address = watch("address");
    const country = watch("country");

    useEffect(() => {
        if (city && state && address && country) {
            const timer = setTimeout(() => {
                calculateFee({ city, state, address, country });
            }, 1000); 
            
            return () => clearTimeout(timer);
        }
    }, [city, state, address, country, calculateFee]);
    // --- KẾT THÚC LOGIC GHTK ---


    // --- LOGIC CHUYỂN HƯỚNG (Từ code cũ) ---
    useEffect(() => {
        if (!isLoading && !hasItems && !orderPlaced) {
            console.log("Cart is empty, redirecting to /cart...");
            navigate("/cart");
        }
    }, [isLoading, hasItems, navigate, orderPlaced]);
    // --- KẾT THÚC LOGIC CHUYỂN HƯỚNG ---


    // --- HÀM onSubmit (ĐÃ GHÉP) ---
    const onSubmit = async (data) => {
        const itemsPayload = cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity || 1
        }));

        const orderPayload = {
            name: data.name,
            email: currentUser?.email,
            address: {
                city: data.city,
                country: data.country,
                state: data.state,
                zipcode: data.zipcode
            },
            phone: data.phone,
            items: itemsPayload, 
            status: 'Pending'
        }

        try {
            setOrderPlaced(true); // (Từ code cũ)

            const newOrder = await createOrder(orderPayload).unwrap();

            if (paymentMethod === 'cod') {
                Swal.fire({
                    title: "Confirmed Order (COD)",
                    text: "Your order placed successfully!",
                    icon: "success",
                    confirmButtonText: "OK"
                });
                dispatch(clearCart());
                navigate("/orders"); // (Sẽ hoạt động đúng)

            } else if (paymentMethod === 'vnpay') {
                
                const paymentRes = await axios.post(`${getBaseUrl()}/api/payment/create-payment-url`, {
                    orderId: newOrder._id 
                });

                dispatch(clearCart());
                window.location.href = paymentRes.data.url;
            }

        } catch (error) {
            console.error("Error placing order:", error);
            setOrderPlaced(false); // (Từ code cũ)
            Swal.fire({
                title: 'Error!',
                text: error.data?.message || 'Failed to place an order. Please try again.',
                icon: 'error'
            });
        }
    }

    if (isLoading) return <Loading />
    
    // Logic render (Từ code cũ)
    if (!hasItems && !orderPlaced) {
        return <Loading />; 
    }
    
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
                        <div>
                             <h2 className="font-semibold text-xl text-gray-600 mb-2">Checkout</h2>
                            <p className="text-gray-500 mb-1">Items: {cartItems.length > 0 ? cartItems.length : 0}</p>
                            <p className="text-gray-500 mb-1">Subtotal: ${subtotal.toFixed(2)}</p>
                            {/* Hiển thị phí GHTK (Từ code mới) */}
                            <p className="text-gray-500 mb-1">
                                Shipping Fee: {isCalculatingFee ? "Calculating..." : `$${shippingFee.toFixed(2)}`}
                            </p>
                            <p className="font-semibold text-lg text-gray-600 mb-6">
                                Total Price: ${totalOrderPriceUSD.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                            {/* ... (Toàn bộ JSX còn lại của form giữ nguyên) ... */}
                            {/* Payment Method */}
                            <div className="mb-6">
                                <p className="font-medium text-lg mb-3">Payment Method</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="cod" 
                                            checked={paymentMethod === 'cod'} 
                                            onChange={() => setPaymentMethod('cod')} 
                                            className="form-radio text-indigo-600"
                                        />
                                        Cash on Delivery (COD)
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="vnpay" 
                                            checked={paymentMethod === 'vnpay'} 
                                            onChange={() => setPaymentMethod('vnpay')} 
                                            className="form-radio text-indigo-600"
                                        />
                                        Pay with VNPay (VND)
                                    </label>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                                <div className="text-gray-600">
                                    <p className="font-medium text-lg">Personal Details</p>
                                    <p>Please fill out all the fields.</p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                        <div className="md:col-span-5">
                                            <label htmlFor="full_name">Full Name</label>
                                            <input
                                                {...register("name", { required: true })}
                                                type="text" name="name" id="name" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>

                                        <div className="md:col-span-5">
                                            <label htmlFor="email">Email Address</label>
                                            <input
                                                type="text" name="email" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                disabled
                                                defaultValue={currentUser?.email}
                                                placeholder="email@domain.com" />
                                        </div>
                                        <div className="md:col-span-5">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                {...register("phone", { required: true })}
                                                type="number" name="phone" id="phone" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="+123 456 7890" />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label htmlFor="address">Address / Street</label>
                                            <input
                                                {...register("address", { required: true })}
                                                type="text" name="address" id="address" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="city">City</label>
                                            <input
                                                {...register("city", { required: true })}
                                                type="text" name="city" id="city" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="country">Country / region</label>
                                            <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                <input
                                                    {...register("country", { required: true })}
                                                    name="country" id="country" placeholder="Country" className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent" />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label htmlFor="state">State / province</label>
                                            <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                <input
                                                    {...register("state", { required: true })}
                                                    name="state" id="state" placeholder="State" className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent" />
                                            </div>
                                        </div>

                                        <div className="md:col-span-1">
                                            <label htmlFor="zipcode">Zipcode</label>
                                            <input
                                                {...register("zipcode", { required: true })}
                                                type="text" name="zipcode" id="zipcode" className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="" />
                                        </div>


                                        <div className="md:col-span-5 mt-3">
                                            <div className="inline-flex items-center">
                                                <input
                                                    onChange={(e) => setIsChecked(e.target.checked)}
                                                    type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                <label htmlFor="billing_same" className="ml-2 ">I agree to the <Link className='underline underline-offset-2 text-blue-600'>Terms & Conditions</Link> and <Link className='underline underline-offset-2 text-blue-600'>Shopping Policy.</Link></label>
                                            </div>
                                        </div>

                                        <div className="md:col-span-5 text-right">
                                            <div className="inline-flex items-end">
                                                <button
                                                    disabled={!isChecked || isLoading || !hasItems || isCalculatingFee} // Thêm isCalculatingFee
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isLoading ? 'Processing...' : 'Place an Order'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CheckoutPage