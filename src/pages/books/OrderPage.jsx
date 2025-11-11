// src/pages/books/OrderPage.jsx
import React, { useEffect, useState } from 'react'; // <-- THÊM useEffect, useState
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom'; // <-- THÊM useLocation

// Hàm helper để đọc query params
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const OrderPage = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError, refetch } = useGetOrderByEmailQuery(currentUser?.email);
  
  // State cho thông báo thanh toán
  const [paymentStatus, setPaymentStatus] = useState(null);
  const query = useQuery();

  useEffect(() => {
    // Kiểm tra query params khi trang được tải
    const responseCode = query.get('vnp_ResponseCode');
    
    if (responseCode === '00') {
        setPaymentStatus({
            type: 'success',
            message: 'Payment completed successfully! Your order is being processed.'
        });
        // Tải lại danh sách đơn hàng để cập nhật trạng thái
        refetch();
    } else if (responseCode && responseCode !== '00') {
        setPaymentStatus({
            type: 'error',
            message: 'Payment failed. Please try again or select a different payment method.'
        });
    }

    // Xóa query params khỏi URL để tránh hiển thị lại thông báo khi refresh
    if (responseCode) {
        window.history.replaceState(null, null, window.location.pathname);
    }
  }, []); // Chỉ chạy 1 lần khi component mount

  // Lọc các đơn hàng cũ (lỗi)
  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError) return <div className="text-center text-red-600 py-10">Error loading orders</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-3xl font-bold text-purple-700 mb-8">Your Orders</h2>

      {/* --- HIỂN THỊ THÔNG BÁO THANH TOÁN --- */}
      {paymentStatus && (
        <div className={`p-4 rounded-md mb-6 ${paymentStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p className="font-semibold">{paymentStatus.message}</p>
        </div>
      )}
      {/* --- KẾT THÚC THÔNG BÁO --- */}


      {validOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No orders found!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {validOrders.map((order, index) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full mb-2">
                    #{index + 1}
                  </p>
                  <h3 className="font-bold text-lg">Order ID: {order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${order.totalPrice.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                <div>
                  <p><strong>Name:</strong> {order.name}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                </div>
                <div>
                  <p><strong>Address:</strong></p>
                  <p className="text-gray-600">
                    {order.address?.city}, {order.address?.state}, {order.address?.country} {order.address?.zipcode && `- ${order.address.zipcode}`}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items Ordered:</h3>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={item.productId || i} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      <p className="font-medium text-green-600">
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
  );
};

export default OrderPage;