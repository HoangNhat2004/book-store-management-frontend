// src/pages/books/OrderPage.jsx
import React, { useEffect, useState } from 'react';
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom'; // <-- THÊM Link
import Loading from '../../components/Loading'; // <-- THÊM Loading

// Hàm helper để đọc query params
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const OrderPage = () => {
  const { currentUser } = useAuth();
  // --- (LOGIC CŨ CỦA BẠN - GIỮ NGUYÊN) ---
  const { data: orders = [], isLoading, isError, refetch } = useGetOrderByEmailQuery(currentUser?.email, {
      skip: !currentUser?.email, // Bỏ qua query nếu chưa có email
  });
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const query = useQuery();

  useEffect(() => {
    const responseCode = query.get('vnp_ResponseCode');
    
    if (responseCode === '00') {
        setPaymentStatus({
            type: 'success',
            message: 'Payment completed successfully! Your order is being processed.'
        });
        refetch();
    } else if (responseCode && responseCode !== '00') {
        setPaymentStatus({
            type: 'error',
            message: 'Payment failed. Please try again or select a different payment method.'
        });
    }

    if (responseCode) {
        window.history.replaceState(null, null, window.location.pathname);
    }
  }, [refetch]); // Thêm refetch vào dependency array
  // --- (KẾT THÚC LOGIC CŨ) ---

  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  if (isLoading) return <Loading />; // Dùng component Loading
  if (isError) return <div className="text-center text-red-600 py-10">Error loading orders</div>;

  // Hàm helper để lấy màu status (ĐÃ CẬP NHẬT MÀU)
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800', // (Giữ màu blue cho processing)
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-accent-light text-accent' // (Dùng màu accent)
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    // --- BẮT ĐẦU "LỘT XÁC" (RESKIN) JSX ---
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h2 className="text-3xl font-heading font-bold text-primary mb-8">Your Orders</h2>

      {/* --- HIỂN THỊ THÔNG BÁO THANH TOÁN (Giao diện mới) --- */}
      {paymentStatus && (
        <div className={`p-4 rounded-md mb-6 border ${
            paymentStatus.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
            <p className="font-semibold">{paymentStatus.message}</p>
        </div>
      )}
      {/* --- KẾT THÚC THÔNG BÁO --- */}


      {validOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-500 bg-white border border-subtle rounded-lg shadow-sm">
            <p className="text-xl font-heading">No orders found!</p>
            <p className="mt-4">Looks like you haven't placed an order yet.</p>
            <Link to="/" className="btn-primary mt-6 inline-block">
                Start Shopping
            </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {validOrders.map((order, index) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-subtle">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink">
                    Order ID: <span className="text-primary">{order._id.slice(-8).toUpperCase()}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-2xl font-heading font-bold text-ink">${order.totalPrice.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    getStatusColor(order.status)
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="border-t border-subtle pt-4 mb-4">
                <h4 className="font-heading text-md font-semibold text-ink mb-3">Shipping Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <p><strong>Name:</strong> {order.name}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong></p>
                    <p className="text-gray-600">
                    {/* (Đảm bảo có order.address.address) */}
                    {order.address?.address}, {order.address?.city}, {order.address?.state}, {order.address?.country} {order.address?.zipcode && `- ${order.address.zipcode}`}
                  </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-subtle pt-4">
                <h4 className="font-heading text-md font-semibold text-ink mb-3">Items Ordered:</h4>
                <div className="space-y-3">
                  {/* (Đã sửa lại để đọc từ order.items) */}
                  {order.items?.map((item, i) => (
                    <div key={item.productId || i} className="flex justify-between items-center bg-paper p-3 rounded-md">
                        <div>
                          <p className="font-medium text-ink">{item.title}</p>
                          <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      <p className="font-medium text-ink">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    // --- KẾT THÚC "LỘT XÁC" JSX ---
  );
};

export default OrderPage;