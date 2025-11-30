import React, { useState, useEffect, useCallback } from 'react'
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
        watch,
        setValue, // Import thêm setValue để điền form
        formState: { errors },
    } = useForm()

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const hasItems = cartItems.length > 0;

    // --- State ---
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
    
    // State lưu địa chỉ đã lưu của user (để auto-fill)
    const [savedAddress, setSavedAddress] = useState(null);
    // --- Kết thúc State ---

    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    const totalOrderPriceUSD = (Number(subtotal) + Number(shippingFee));

    // ========================================================================
    // 1. LOGIC LẤY THÔNG TIN NGƯỜI DÙNG & AUTO-FILL
    // ========================================================================
    useEffect(() => {
        if (currentUser?.email) {
            // Gọi API lấy thông tin user (bao gồm defaultAddress)
            // Lưu ý: Bạn cần đảm bảo route /api/auth/:email đã được tạo ở Backend như hướng dẫn trước
            axios.get(`${getBaseUrl()}/api/auth/${currentUser.email}`)
                .then(res => {
                    if (res.data && res.data.defaultAddress) {
                        const addr = res.data.defaultAddress;
                        setSavedAddress(addr);

                        // Điền các trường text
                        setValue('name', currentUser.displayName || currentUser.username || "");
                        setValue('email', currentUser.email);
                        setValue('phone', addr.phone || "");
                        setValue('address', addr.address || "");
                    }
                })
                .catch(err => console.log("No saved address found or API not ready."));
        }
    }, [currentUser, setValue]);

    // ========================================================================
    // 2. LOGIC GHN (TỈNH -> HUYỆN -> XÃ) + AUTO-SELECT
    // ========================================================================

    // 2.1. Lấy danh sách Tỉnh/Thành
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await axios.get(`${getBaseUrl()}/api/shipping/provinces`);
                const provinceData = response.data.data || [];
                setProvinces(provinceData);

                // AUTO-SELECT TỈNH nếu có savedAddress
                if (savedAddress && savedAddress.province_id) {
                    const found = provinceData.find(p => p.ProvinceID === savedAddress.province_id);
                    if (found) setSelectedProvince(found);
                }
            } catch (error) {
                console.error("Error fetching provinces", error);
            }
        };
        // Chỉ chạy khi đã có savedAddress (hoặc lần đầu load nếu chưa có savedAddress)
        // Dùng cờ hoặc check length để tránh loop, ở đây ta phụ thuộc vào savedAddress
        fetchProvinces();
    }, [savedAddress]); 

    // 2.2. Lấy Quận/Huyện khi Tỉnh thay đổi
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedProvince) {
                try {
                    const response = await axios.post(`${getBaseUrl()}/api/shipping/districts`, 
                        { province_id: selectedProvince.ProvinceID }
                    );
                    const districtData = response.data.data || [];
                    setDistricts(districtData);

                    // AUTO-SELECT HUYỆN nếu khớp ID và Tỉnh đã chọn đúng
                    if (savedAddress && savedAddress.district_id && savedAddress.province_id === selectedProvince.ProvinceID) {
                        const found = districtData.find(d => d.DistrictID === savedAddress.district_id);
                        if (found) setSelectedDistrict(found);
                    } else {
                        // Nếu user tự đổi tỉnh, reset huyện
                        setSelectedDistrict(null); 
                    }
                } catch (error) {
                    console.error("Error fetching districts", error);
                }
            } else {
                setDistricts([]);
                setSelectedDistrict(null);
            }
        };
        fetchDistricts();
    }, [selectedProvince, savedAddress]);

    // 2.3. Lấy Phường/Xã khi Quận thay đổi
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedDistrict) {
                try {
                    const response = await axios.post(`${getBaseUrl()}/api/shipping/wards`, 
                        { district_id: selectedDistrict.DistrictID }
                    );
                    const wardData = response.data.data || [];
                    setWards(wardData);

                    // AUTO-SELECT XÃ
                    if (savedAddress && savedAddress.ward_code && savedAddress.district_id === selectedDistrict.DistrictID) {
                        const found = wardData.find(w => w.WardCode === savedAddress.ward_code);
                        if (found) setSelectedWard(found);
                    } else {
                        setSelectedWard(null);
                    }
                } catch (error) {
                    console.error("Error fetching wards", error);
                }
            } else {
                setWards([]);
                setSelectedWard(null);
            }
        };
        fetchWards();
    }, [selectedDistrict, savedAddress]);


    // 4. Hàm tính phí
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

    // 5. Tự động tính phí khi chọn xong Xã
    useEffect(() => {
        if (selectedWard) {
            calculateFee(selectedWard.DistrictID, selectedWard.WardCode);
        } else {
            setShippingFee(0);
        }
    }, [selectedWard, calculateFee]);

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

        // Object chứa thông tin địa chỉ đầy đủ để lưu vào DB
        const fullAddressData = {
            address: data.address,
            city: selectedDistrict.DistrictName,
            state: selectedProvince.ProvinceName,
            ward: selectedWard.WardName,
            country: "Vietnam",
            zipcode: data.zipcode,
            
            // Các ID quan trọng cho GHN
            province_id: selectedProvince.ProvinceID,
            district_id: selectedDistrict.DistrictID,
            ward_code: selectedWard.WardCode,
            
            phone: data.phone // Lưu kèm SĐT để tiện liên lạc
        };

        const orderPayload = {
            name: data.name,
            email: currentUser?.email,
            address: fullAddressData,
            phone: data.phone,
            items: itemsPayload, 
            status: 'Pending'
        }

        try {
            setOrderPlaced(true); 
            const newOrder = await createOrder(orderPayload).unwrap();

            // --- TÍNH NĂNG MỚI: LƯU ĐỊA CHỈ CHO LẦN SAU ---
            try {
                if (currentUser?.email) {
                    // Gọi API update-address đã tạo ở Backend
                    await axios.put(`${getBaseUrl()}/api/auth/update-address`, fullAddressData, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('userToken')}` 
                        }
                    });
                    console.log("Address saved successfully!");
                }
            } catch (saveError) {
                console.warn("Failed to save address for future use", saveError);
                // Không chặn quy trình đặt hàng nếu lưu địa chỉ lỗi
            }
            // --------------------------------------------------

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
    if (!hasItems && !orderPlaced) return <Loading />; 
    
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

                                        {/* Tỉnh/Thành - SỬA THÀNH CONTROLLED COMPONENT */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="province">Tỉnh / Thành phố</label>
                                            <select 
                                                id="province"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                // Giá trị được kiểm soát bởi state
                                                value={selectedProvince ? JSON.stringify(selectedProvince) : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value ? JSON.parse(e.target.value) : null;
                                                    setSelectedProvince(val);
                                                }}
                                                required
                                            >
                                                <option value="">Chọn Tỉnh/Thành</option>
                                                {provinces.map(p => (
                                                    <option key={p.ProvinceID} value={JSON.stringify(p)}>{p.ProvinceName}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quận/Huyện - SỬA THÀNH CONTROLLED COMPONENT */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="district">Quận / Huyện</label>
                                            <select 
                                                id="district"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                value={selectedDistrict ? JSON.stringify(selectedDistrict) : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value ? JSON.parse(e.target.value) : null;
                                                    setSelectedDistrict(val);
                                                }}
                                                disabled={!selectedProvince}
                                                required
                                            >
                                                <option value="">Chọn Quận/Huyện</option>
                                                {districts.map(d => (
                                                    <option key={d.DistrictID} value={JSON.stringify(d)}>{d.DistrictName}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        {/* Phường/Xã - SỬA THÀNH CONTROLLED COMPONENT */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="ward">Phường / Xã</label>
                                            <select 
                                                id="ward"
                                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                value={selectedWard ? JSON.stringify(selectedWard) : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value ? JSON.parse(e.target.value) : null;
                                                    setSelectedWard(val);
                                                }}
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
                                                    disabled={!isChecked || isLoading || !hasItems || isCalculatingFee || !selectedWard} 
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