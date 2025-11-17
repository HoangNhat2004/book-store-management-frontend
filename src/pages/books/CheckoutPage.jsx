import React, { useState, useEffect, useCallback } from 'react'
// --- SỬA LỖI 1: IMPORT DÙNG CHO cartItems ---
import { useDispatch, useSelector } from 'react-redux';
// --- KẾT THÚC SỬA ---
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { clearCart } from '../../redux/features/cart/cartSlice';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';
import Loading from '../../components/Loading';

// --- SỬA LỖI 2: XÓA TOKEN BỊ LỘ ---
// const GHN_API_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api"; // XÓA
// const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN; // XÓA
// --- KẾT THÚC SỬA ---

// Tỷ giá (chỉ để hiển thị cho frontend)
const EXCHANGE_RATE_USD_TO_VND = 25000;

const CheckoutPage = () => {
    // --- SỬA LỖI 3: THÊM LẠI DÒNG BỊ THIẾU ---
    const cartItems = useSelector(state => state.cart.cartItems);
    // --- KẾT THÚC SỬA ---

    const { currentUser } = useAuth()
    const {
        register,
        handleSubmit,
        watch, 
        formState: { errors },
    } = useForm()

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hasItems = cartItems.length > 0;

    // --- (State cho địa chỉ và phí ship) ---
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isChecked, setIsChecked] = useState(false)
    const [shippingFee, setShippingFee] = useState(0); 
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    // --- (Kết thúc State) ---

    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    const totalOrderPriceUSD = (Number(subtotal) + Number(shippingFee));

    // --- SỬA LỖI 4: GỌI API ĐỊA CHỈ QUA BACKEND (PROXY) ---

    // 1. Lấy Tỉnh/Thành phố (GỌI BACKEND)
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                // Sửa: Gọi API proxy /api/shipping/provinces
                const response = await axios.get(`${getBaseUrl()}/api/shipping/provinces`);
                setProvinces(response.data.data || []);
            } catch (error) {
                console.error("Error fetching provinces", error);
            }
        };
        fetchProvinces();
}, []); // Chỉ chạy 1 lần

    // 2. Lấy Quận/Huyện khi Tỉnh thay đổi (GỌI BACKEND)
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedProvince) {
                try {
                    // Sửa: Gọi API proxy /api/shipping/districts (dùng POST)
                    const response = await axios.post(`${getBaseUrl()}/api/shipping/districts`, 
                        { province_id: selectedProvince.ProvinceID }
                    );
                    setDistricts(response.data.data || []);
                } catch (error) {
                    console.error("Error fetching districts", error);
                }
            }
            setWards([]); // Reset Phường/Xã
            setSelectedWard(null);
        };
        fetchDistricts();
    }, [selectedProvince]);

    // 3. Lấy Phường/Xã khi Quận thay đổi (GỌI BACKEND)
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedDistrict) {
                try {
                    // Sửa: Gọi API proxy /api/shipping/wards (dùng POST)
                    const response = await axios.post(`${getBaseUrl()}/api/shipping/wards`, 
                        { district_id: selectedDistrict.DistrictID }
                    );
                    setWards(response.data.data || []);
                } catch (error) {
                    console.error("Error fetching wards", error);
                }
            }
        };
        fetchWards();
    }, [selectedDistrict]);

    // --- KẾT THÚC SỬA LỖI 4 ---

    // 4. Hàm tính phí (Đã đúng, gọi backend /api/shipping/calculate-fee)
    const calculateFee = useCallback(async (districtID, wardCode) => {
        setIsCalculatingFee(true);
        try {
            const response = await axios.post(`${getBaseUrl()}/api/shipping/calculate-fee`, {
                to_district_id: districtID,
                to_ward_code: wardCode,
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

    // 5. Tự động tính phí khi chọn Phường/Xã (Đã đúng)
    useEffect(() => {
        if (selectedWard) {
            calculateFee(selectedWard.DistrictID, selectedWard.WardCode);
        } else {
            setShippingFee(0); // Reset phí nếu chưa chọn
        }
    }, [selectedWard, calculateFee]);

    // --- (Logic chuyển hướng và onSubmit giữ nguyên như code bạn dán) ---

    useEffect(() => {
        if (!isLoading && !hasItems && !orderPlaced) {
            navigate("/cart");
        }
    }, [isLoading, hasItems, navigate, orderPlaced]);

    const onSubmit = async (data) => {
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
Swal.fire('Error!', 'Please select your full shipping address.', 'error');
            return;
        }

        const itemsPayload = cartItems.map(item => ({
            productId: item._id,
            quantity: item.quantity || 1
        }));

        const orderPayload = {
            name: data.name,
            email: currentUser?.email,
            address: {
                // Gửi cả text (lấy từ state) và ID (lấy từ state)
                address: data.address, // Số nhà
                city: selectedDistrict.DistrictName, // Quận/Huyện
                state: selectedProvince.ProvinceName, // Tỉnh/TP
                ward: selectedWard.WardName, // Phường/Xã
                country: "Vietnam",
                zipcode: data.zipcode, 
                
                // Gửi ID để backend lưu và tính phí
                to_district_id: selectedDistrict.DistrictID,
                to_ward_code: selectedWard.WardCode,
                to_province_id: selectedProvince.ProvinceID,
            },
            phone: data.phone,
            items: itemsPayload, 
            status: 'Pending'
        }

        try {
            setOrderPlaced(true); 
            const newOrder = await createOrder(orderPayload).unwrap();

            if (paymentMethod === 'cod') {
                Swal.fire("Confirmed Order (COD)", "Your order placed successfully!", "success");
                dispatch(clearCart());
                navigate("/orders"); 
            } else if (paymentMethod === 'vnpay') {
                const paymentRes = await axios.post(`${getBaseUrl()}/api/payment/create-payment-url`, {
                    orderId: newOrder._id 
                });
                dispatch(clearCart());
                window.location.href = paymentRes.data.url;
            }

        } catch (error) {
            console.error("Error placing order:", error);
            setOrderPlaced(false); 
            Swal.fire('Error!', error.data?.message || 'Failed to place an order.', 'error');
        }
    }

    if (isLoading) return <Loading />
    
    if (!hasItems && !orderPlaced) {
        return <Loading />; 
    }
    
    // --- (Toàn bộ JSX Giữ nguyên như code bạn dán) ---
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
                        {/* Tóm tắt đơn hàng */}
                        <div>
                             <h2 className="font-semibold text-xl text-gray-600 mb-2">Checkout</h2>
                             <p className="text-gray-500 mb-1">Items: {cartItems.length > 0 ? cartItems.length : 0}</p>
                             <p className="text-gray-500 mb-1">Subtotal: ${subtotal.toFixed(2)}</p>
                             <p className="text-gray-500 mb-1">
Shipping Fee: {isCalculatingFee ? "Calculating..." : `$${shippingFee.toFixed(2)}`}
                             </p>
                             <p className="font-semibold text-lg text-gray-600 mb-6">
                                 Total Price: ${totalOrderPriceUSD.toFixed(2)}
                             </p>
                        </div>

                        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                            {/* Phương thức thanh toán */}
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
                                        {/* Tên */}
<div className="md:col-span-5">
                                            <label htmlFor="full_name">Full Name</label>
                                            <input
                                                {...register("name", { required: true })}
                                                type="text" name="name" id="name" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" />
                                        </div>
                                        {/* Email */}
                                        <div className="md:col-span-5">
                                            <label htmlFor="email">Email Address</label>
                                            <input
                                                type="text" name="email" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                disabled
                                                defaultValue={currentUser?.email}
                                                placeholder="email@domain.com" />
                                        </div>
                                        {/* SĐT */}
                                        <div className="md:col-span-5">
                                            <label htmlFor="phone">Phone Number</label>
                                            <input
                                                {...register("phone", { required: true })}
                                                type="number" name="phone" id="phone" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="+123 456 7890" />
                                        </div>

                                        {/* Địa chỉ / Đường */}
                                        <div className="md:col-span-5">
                                            <label htmlFor="address">Address / Street</label>
                                            <input
                                                {...register("address", { required: true })}
                                                type="text" name="address" id="address" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="Số nhà, tên đường..." />
                                        </div>

                                        {/* Tỉnh/Thành */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="province">Tỉnh / Thành phố</label>
                                            <select 
                                                id="province"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                onChange={(e) => setSelectedProvince(JSON.parse(e.target.value))}
                                                required
>
                                                <option value="">Chọn Tỉnh/Thành</option>
                                                {provinces.map(p => (
                                                    <option key={p.ProvinceID} value={JSON.stringify(p)}>{p.ProvinceName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quận/Huyện */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="district">Quận / Huyện</label>
                                            <select 
                                                id="district"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                onChange={(e) => setSelectedDistrict(JSON.parse(e.target.value))}
                                                disabled={!selectedProvince}
                                                required
                                            >
                                                <option value="">Chọn Quận/Huyện</option>
                                                {districts.map(d => (
                                                    <option key={d.DistrictID} value={JSON.stringify(d)}>{d.DistrictName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Phường/Xã */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="ward">Phường / Xã</label>
                                            <select 
                                                id="ward"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                onChange={(e) => setSelectedWard(JSON.parse(e.target.value))}
                                                disabled={!selectedDistrict}
                                                required
                                            >
                                                <option value="">Chọn Phường/Xã</option>
                                                {wards.map(w => (
                                                    <option key={w.WardCode} value={JSON.stringify(w)}>{w.WardName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Zipcode */}
                                        <div className="md:col-span-1">
<label htmlFor="zipcode">Zipcode</label>
                                            <input
                                                {...register("zipcode")}
                                                type="text" name="zipcode" id="zipcode" className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50" placeholder="(Optional)" />
                                        </div>

                                        {/* Checkbox */}
                                        <div className="md:col-span-5 mt-3">
                                            <div className="inline-flex items-center">
                                                <input
                                                    onChange={(e) => setIsChecked(e.target.checked)}
                                                    type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                <label htmlFor="billing_same" className="ml-2 ">I agree to the <Link className='underline underline-offset-2 text-blue-600'>Terms & Conditions</Link> and <Link className='underline underline-offset-2 text-blue-600'>Shopping Policy.</Link></label>
                                            </div>
                                        </div>

                                        {/* Nút Submit */}
                                        <div className="md:col-span-5 text-right">
                                            <div className="inline-flex items-end">
                                                <button
                                                    disabled={!isChecked || isLoading || !hasItems || isCalculatingFee || !selectedWard} // Thêm !selectedWard
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                                    {isLoading ? 'Processing...' : (isCalculatingFee ? 'Calculating Fee...' : 'Place an Order')}
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