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
                address: data.address, // <-- 2. THÊM DÒNG NÀY (ĐỊA CHỈ ĐƯỜNG PHỐ)
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
        <section className="py-12">
            <div className="container max-w-screen-lg mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Cột trái: Tóm tắt đơn hàng */}
                    <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-subtle h-fit">
                        <h2 className="text-2xl font-heading font-bold text-primary mb-6">Order Summary</h2>
                        <div className="space-y-3 text-ink">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Items:</span>
                                <span className="font-medium">{cartItems.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping Fee:</span>
                                <span className="font-medium">
                                    {isCalculatingFee ? "Calculating..." : `$${shippingFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="border-t border-subtle my-3"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total Price:</span>
                                <span>${totalOrderPriceUSD.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Form thông tin */}
                    <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-subtle">
                        {/* Phương thức thanh toán */}
                        <div className="mb-8">
                            <h3 className="text-xl font-heading font-semibold mb-4 text-ink">Payment Method</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-primary ring-2 ring-primary' : 'border-subtle'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cod" 
                                        checked={paymentMethod === 'cod'} 
                                        onChange={() => setPaymentMethod('cod')} 
                                        className="form-radio text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium text-ink">Cash on Delivery (COD)</span>
                                </label>
                                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'vnpay' ? 'border-primary ring-2 ring-primary' : 'border-subtle'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="vnpay" 
                                        checked={paymentMethod === 'vnpay'} 
                                        onChange={() => setPaymentMethod('vnpay')} 
                                        className="form-radio text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium text-ink">Pay with VNPay (VND)</span>
                                </label>
                            </div>
                        </div>

                        {/* Form chi tiết */}
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <h3 className="text-xl font-heading font-semibold mb-4 text-ink">Personal Details</h3>
                            <p className="text-gray-600 mb-6">Please fill out all the fields.</p>

                            <div className="grid gap-4 gap-y-5 text-sm grid-cols-1 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label htmlFor="full_name" className="block text-sm font-medium text-ink mb-1">Full Name</label>
                                    <input
                                        {...register("name", { required: true })}
                                        type="text" name="name" id="name" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email Address</label>
                                    <input
                                        type="text" name="email" id="email" className="h-12 border border-subtle rounded-md px-4 w-full bg-gray-100"
                                        disabled
                                        defaultValue={currentUser?.email}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1">Phone Number</label>
                                    <input
                                        {...register("phone", { required: true })}
                                        type="number" name="phone" id="phone" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" placeholder="+123 456 7890" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="address" className="block text-sm font-medium text-ink mb-1">Address / Street</label>
                                    <input
                                        {...register("address", { required: true })}
                                        type="text" name="address" id="address" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="city" className="block text-sm font-medium text-ink mb-1">City (Quận/Huyện)</label>
                                    <input
                                        {...register("city", { required: true })}
                                        type="text" name="city" id="city" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="state" className="block text-sm font-medium text-ink mb-1">State / province (Tỉnh/TP)</label>
                                    <input
                                        {...register("state", { required: true })}
                                        name="state" id="state" placeholder="State" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="country" className="block text-sm font-medium text-ink mb-1">Country / region</label>
                                    <input
                                        {...register("country", { required: true })}
                                        name="country" id="country" placeholder="Country" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-1">
                                    <label htmlFor="zipcode" className="block text-sm font-medium text-ink mb-1">Zipcode</label>
                                    <input
                                        {...register("zipcode", { required: true })}
                                        type="text" name="zipcode" id="zipcode" className="h-12 border border-subtle rounded-md px-4 w-full focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="md:col-span-2 mt-3">
                                    <div className="inline-flex items-center">
                                        <input
                                            onChange={(e) => setIsChecked(e.target.checked)}
                                            type="checkbox" name="billing_same" id="billing_same" className="form-checkbox text-primary focus:ring-primary" />
                                        <label htmlFor="billing_same" className="ml-2 text-ink">I agree to the <Link className='underline text-primary'>Terms & Conditions</Link> and <Link className='underline text-primary'>Shopping Policy.</Link></label>
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <div className="inline-flex items-end">
                                        <button
                                            disabled={!isChecked || isLoading || !hasItems || isCalculatingFee}
                                            className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isLoading ? 'Processing...' : 'Place an Order'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CheckoutPage