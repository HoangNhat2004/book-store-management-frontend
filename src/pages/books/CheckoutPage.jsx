import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
// Import API lấy giỏ hàng và XÓA GIỎ HÀNG DB
import { useGetCartQuery, useClearCartDBMutation } from '../../redux/features/cart/cartApi'; 
import { clearCart } from '../../redux/features/cart/cartSlice';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';
import Loading from '../../components/Loading';

const EXCHANGE_RATE_USD_TO_VND = 25000;

const CheckoutPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- LOGIC GIỎ HÀNG ---
    const localCartItems = useSelector(state => state.cart.cartItems);
    const { data: dbCart } = useGetCartQuery(undefined, { skip: !currentUser });
    const [clearCartDB] = useClearCartDBMutation(); // Hook xóa giỏ DB

    const cartItems = currentUser 
        ? (dbCart?.items?.map(item => {
             if (!item.productId) return null;
             return { ...item.productId, quantity: item.quantity };
          }).filter(i => i) || [])
        : localCartItems;

    const hasItems = cartItems.length > 0;
    // ---------------------

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm()

    const [createOrder, { isLoading }] = useCreateOrderMutation();

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
    const [savedAddress, setSavedAddress] = useState(null);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0);
    const totalOrderPriceUSD = (Number(subtotal) + Number(shippingFee));

    const getIds = (p, d, w) => ({
        pId: p?.ProvinceID || p?.province_id,
        dId: d?.DistrictID || d?.district_id,
        wCode: w?.WardCode || w?.ward_code
    });

    // 1. Auto-fill
    useEffect(() => {
        if (currentUser?.email) {
            axios.get(`${getBaseUrl()}/api/auth/${currentUser.email}`)
                .then(res => {
                    if (res.data && res.data.defaultAddress) {
                        const addr = res.data.defaultAddress;
                        setSavedAddress(addr);
                        setValue('name', currentUser.displayName || res.data.username || "");
                        setValue('email', currentUser.email);
                        setValue('phone', addr.phone || "");
                        setValue('address', addr.address || "");
                        setValue('zipcode', addr.zipcode || "");
                    }
                })
                .catch(err => console.log("Fetch address error"));
        }
    }, [currentUser, setValue]);

    // 2. Provinces
    useEffect(() => {
        axios.get(`${getBaseUrl()}/api/shipping/provinces`).then(res => {
            setProvinces(res.data.data || []);
            if (savedAddress?.province_id) {
                const found = (res.data.data || []).find(p => p.ProvinceID === savedAddress.province_id);
                if (found) setSelectedProvince(found);
            }
        });
    }, [savedAddress]);

    // 3. Districts
    useEffect(() => {
        const pId = selectedProvince?.ProvinceID || selectedProvince?.province_id;
        if (pId) {
            axios.post(`${getBaseUrl()}/api/shipping/districts`, { province_id: pId }).then(res => {
                setDistricts(res.data.data || []);
                if (savedAddress?.district_id && savedAddress.province_id === pId) {
                    const found = (res.data.data || []).find(d => d.DistrictID === savedAddress.district_id);
                    if (found) setSelectedDistrict(found);
                } else {
                    setSelectedDistrict(null);
                }
            });
        } else {
            setDistricts([]);
            setSelectedDistrict(null);
        }
    }, [selectedProvince, savedAddress]);

    // 4. Wards
    useEffect(() => {
        const dId = selectedDistrict?.DistrictID || selectedDistrict?.district_id;
        if (dId) {
            axios.post(`${getBaseUrl()}/api/shipping/wards`, { district_id: dId }).then(res => {
                setWards(res.data.data || []);
                if (savedAddress?.ward_code && savedAddress.district_id === dId) {
                    const found = (res.data.data || []).find(w => w.WardCode === savedAddress.ward_code);
                    if (found) setSelectedWard(found);
                } else {
                    setSelectedWard(null);
                }
            });
        } else {
            setWards([]);
            setSelectedWard(null);
        }
    }, [selectedDistrict, savedAddress]);

    // 5. Fee
    const calculateFee = useCallback(async (dId, wCode) => {
        if(!dId || !wCode) return;
        setIsCalculatingFee(true);
        try {
            const res = await axios.post(`${getBaseUrl()}/api/shipping/calculate-fee`, {
                to_district_id: dId,
                to_ward_code: wCode,
            });
            setShippingFee((res.data.shippingFee || 0) / EXCHANGE_RATE_USD_TO_VND);
        } catch (e) { setShippingFee(0); } 
        finally { setIsCalculatingFee(false); }
    }, []);

    useEffect(() => {
        const { dId, wCode } = getIds(selectedProvince, selectedDistrict, selectedWard);
        if (dId && wCode) calculateFee(dId, wCode);
        else setShippingFee(0);
    }, [selectedProvince, selectedDistrict, selectedWard, calculateFee]);

    // Chặn redirect
    useEffect(() => {
        if (!isLoading && !hasItems && !orderPlaced) {
            navigate("/cart");
        }
    }, [isLoading, hasItems, navigate, orderPlaced]);

    const onSubmit = async (data) => {
        const { pId, dId, wCode } = getIds(selectedProvince, selectedDistrict, selectedWard);

        if (!pId || !dId || !wCode) {
            Swal.fire('Error!', 'Please select full shipping address.', 'error');
            return;
        }

        const fullAddressData = {
            address: data.address,
            city: selectedDistrict.DistrictName || selectedDistrict.Name || "",
            state: selectedProvince.ProvinceName || selectedProvince.Name || "",
            ward: selectedWard.WardName || selectedWard.Name || "",
            country: "Vietnam",
            zipcode: data.zipcode,
            province_id: pId,
            district_id: dId,
            ward_code: wCode,
            to_province_id: pId,
            to_district_id: dId,
            to_ward_code: wCode,
            phone: data.phone 
        };

        // Lưu địa chỉ
        try {
            if (currentUser?.email) {
                const token = localStorage.getItem('userToken') || localStorage.getItem('token');
                await axios.put(`${getBaseUrl()}/api/auth/update-address`, fullAddressData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (e) {}

        const orderPayload = {
            name: data.name,
            email: currentUser?.email,
            address: fullAddressData,
            phone: data.phone,
            items: cartItems.map(item => ({ productId: item._id, quantity: item.quantity || 1 })), 
            status: 'Pending'
        }

        try {
            setOrderPlaced(true); 
            const newOrder = await createOrder(orderPayload).unwrap();

            // --- HÀM XÓA GIỎ HÀNG CHUNG ---
            const handleClearCartAll = async () => {
                if (currentUser) {
                    // Nếu đã login: Xóa DB
                    try { await clearCartDB().unwrap(); } catch (e) { console.error("Clear DB cart failed", e); }
                } 
                // Luôn xóa Local để chắc chắn
                dispatch(clearCart());
            };
            // ------------------------------

            if (paymentMethod === 'cod') {
                Swal.fire("Success", "Order placed successfully!", "success");
                await handleClearCartAll(); // Xóa giỏ hàng
                navigate("/orders"); 
            } else if (paymentMethod === 'vnpay') {
                const paymentRes = await axios.post(`${getBaseUrl()}/api/payment/create-payment-url`, {
                    orderId: newOrder._id 
                });
                await handleClearCartAll(); // Xóa giỏ hàng
                window.location.href = paymentRes.data.url;
            }
        } catch (error) {
            setOrderPlaced(false); 
            const msg = error?.data?.message || 'Failed to place order.';
            Swal.fire('Order Failed', msg, 'error');
        }
    }

    if (isLoading) return <Loading />
    if (!hasItems && !orderPlaced) return <Loading />; 
    
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
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
                            <div className="mb-6">
                                <p className="font-medium text-lg mb-3">Payment Method</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <input 
                                            type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="form-radio text-indigo-600"
                                        />
                                        Cash on Delivery (COD)
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-md cursor-pointer flex-1">
                                        <input 
                                            type="radio" name="paymentMethod" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="form-radio text-indigo-600"
                                        />
                                        Pay with VNPay (VND)
                                    </label>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                                <div className="text-gray-600">
                                    <p className="font-medium text-lg">Personal Details</p>
                                    <p>Please fill out all the fields.</p>
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                        <div className="md:col-span-5"><label>Full Name</label><input {...register("name", { required: true })} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" /></div>
                                        <div className="md:col-span-5"><label>Email</label><input type="text" disabled defaultValue={currentUser?.email} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" /></div>
                                        <div className="md:col-span-5"><label>Phone</label><input {...register("phone", { required: true })} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" /></div>
                                        <div className="md:col-span-5"><label>Address</label><input {...register("address", { required: true })} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" /></div>
                                        
                                        <div className="md:col-span-2">
                                            <label>Province</label>
                                            <select className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={selectedProvince ? JSON.stringify(selectedProvince) : ""} onChange={(e) => setSelectedProvince(JSON.parse(e.target.value))} required>
                                                <option value="">Select Province</option>
                                                {provinces.map(p => <option key={p.ProvinceID} value={JSON.stringify(p)}>{p.ProvinceName}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label>District</label>
                                            <select className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={selectedDistrict ? JSON.stringify(selectedDistrict) : ""} onChange={(e) => setSelectedDistrict(JSON.parse(e.target.value))} disabled={!selectedProvince} required>
                                                <option value="">Select District</option>
                                                {districts.map(d => <option key={d.DistrictID} value={JSON.stringify(d)}>{d.DistrictName}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1">
                                            <label>Ward</label>
                                            <select className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" value={selectedWard ? JSON.stringify(selectedWard) : ""} onChange={(e) => setSelectedWard(JSON.parse(e.target.value))} disabled={!selectedDistrict} required>
                                                <option value="">Select Ward</option>
                                                {wards.map(w => <option key={w.WardCode} value={JSON.stringify(w)}>{w.WardName}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-1"><label>Zipcode</label><input {...register("zipcode")} className="h-10 border mt-1 rounded px-4 w-full bg-gray-50" /></div>

                                        <div className="md:col-span-5 mt-3">
                                            <div className="inline-flex items-center">
                                                <input onChange={(e) => setIsChecked(e.target.checked)} checked={isChecked} type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                <label htmlFor="billing_same" className="ml-2 ">I agree to the Terms & Conditions.</label>
                                            </div>
                                        </div>

                                        <div className="md:col-span-5 text-right">
                                            <div className="inline-flex items-end">
                                                <button disabled={!isChecked || isLoading || !hasItems || isCalculatingFee || !selectedWard} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">
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