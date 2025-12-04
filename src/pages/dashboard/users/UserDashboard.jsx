import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGetOrderByEmailQuery } from '../../../redux/features/orders/ordersApi';
import axios from 'axios';
import getBaseUrl from '../../../utils/baseURL';
import Loading from '../../../components/Loading';

const UserDashboard = () => {
    const { currentUser } = useAuth();
    
    // Skip gọi API nếu chưa có email để tránh lỗi 404
    const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email, {
        skip: !currentUser?.email
    });
    
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (currentUser?.email) {
            axios.get(`${getBaseUrl()}/api/auth/${currentUser.email}`)
                .then(res => setUserInfo(res.data))
                .catch(err => console.error(err));
        }
    }, [currentUser]);

    if (isLoading) return <Loading />;
    if (isError) return <div className="text-center py-10 text-red-500">Error getting orders data</div>;

    return (
        <div className="bg-gray-100 py-16 min-h-screen">
            <div className="container mx-auto px-4">
                <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
                    
                    {/* Phần Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {userInfo?.username || currentUser?.displayName}!</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                Role: {userInfo?.role || 'User'}
                            </span>
                        </div>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Thông tin cá nhân */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <p><strong>Email:</strong> {currentUser?.email}</p>
                                <p><strong>User ID:</strong> {currentUser?.uid}</p>
                                <p><strong>Last Login:</strong> {new Date(currentUser?.metadata.lastSignInTime).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Địa chỉ mặc định */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Default Shipping Address</h2>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-full">
                                {userInfo?.defaultAddress ? (
                                    <div className="text-sm space-y-1">
                                        <p><strong>Address:</strong> {userInfo.defaultAddress.address}</p>
                                        <p><strong>Ward:</strong> {userInfo.defaultAddress.ward}</p>
                                        <p><strong>District:</strong> {userInfo.defaultAddress.city}</p> 
                                        <p><strong>City/Province:</strong> {userInfo.defaultAddress.state}</p>
                                        <p><strong>Phone:</strong> {userInfo.defaultAddress.phone}</p>
                                        <p><strong>Zipcode:</strong> {userInfo.defaultAddress.zipcode || 'N/A'}</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No default address saved yet. Please checkout to save one.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr className="my-6 border-gray-200" />

                    {/* Danh sách đơn hàng */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Your Recent Orders</h2>
                        {orders.length > 0 ? (
                            <ul className="space-y-4">
                                {orders.map((order) => (
                                    <li key={order._id} className="bg-[#f9f9f9] p-4 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-medium">Order ID: <span className='text-gray-500'>#{order._id.slice(-6).toUpperCase()}</span></p>
                                            <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <p className="text-gray-600 mb-1 font-semibold">Total: ${order.totalPrice.toFixed(2)}</p>
                                        
                                        {/* --- ĐÃ SỬA LỖI Ở ĐÂY: Dùng order.items thay vì order.productIds --- */}
                                        <div className="mb-2 bg-white p-2 rounded border border-gray-100">
                                            {order.items?.map((item, index) => (
                                                <div key={index} className='flex justify-between text-sm text-gray-600 py-1'>
                                                    <span>• {item.title || "Book Item"}</span>
                                                    <span>x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* ----------------------------------------------------------------- */}

                                        {/* Trạng thái đơn hàng */}
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`px-2 py-1 rounded text-xs text-white ${
                                                order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500' : 
                                                order.status === 'Shipped' ? 'bg-purple-500' :
                                                order.status === 'Processing' ? 'bg-blue-500' :
                                                'bg-yellow-500'
                                            }`}>
                                                {order.status}
                                            </span>
                                            
                                            {/* Hiển thị mã GHN */}
                                            {order.ghnOrderCode && (
                                                <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded font-bold">
                                                    📦 GHN: {order.ghnOrderCode}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
                                You have no recent orders.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;