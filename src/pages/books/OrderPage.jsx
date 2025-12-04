// src/pages/books/OrderPage.jsx
import React, { useEffect, useState } from 'react';
import { useGetOrderByEmailQuery, useConfirmPaymentMutation } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Loading from '../../components/Loading';

// Hàm helper để đọc query params
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const OrderPage = () => {
  const { currentUser } = useAuth();
  
  // Skip query nếu chưa có email để tránh lỗi 404/400
  const { data: orders = [], isLoading, isError, refetch } = useGetOrderByEmailQuery(currentUser?.email, {
      skip: !currentUser?.email, 
  });
  
  const [confirmPayment] = useConfirmPaymentMutation();
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const query = useQuery();

  const responseCode = query.get('vnp_ResponseCode');
  const orderIdFromVNPay = query.get('vnp_TxnRef');

  useEffect(() => {
    // 1. Xóa query params để tránh chạy lại logic khi refresh
    if (responseCode) {
        window.history.replaceState(null, null, window.location.pathname);
    }

    const handlePaymentResult = async (code, orderId) => {
        if (code === '00' && orderId) {
            // THANH TOÁN THÀNH CÔNG
            setPaymentStatus({
                type: 'success',
                message: 'Payment successful! Updating order status...'
            });
            
            try {
                // Gọi API xác nhận thanh toán
                await confirmPayment(orderId).unwrap();
                
                setPaymentStatus({
                    type: 'success',
                    message: 'Payment completed successfully! Your order is being processed.'
                });
                
                refetch(); // Tải lại danh sách đơn hàng

            } catch (error) {
                console.error("Failed to confirm payment:", error);
                setPaymentStatus({
                    type: 'error',
                    message: 'Payment was successful at VNPay, but we failed to update the order status. Please contact support.'
                });
            }

        } else if (code === '24') {
            // NGƯỜI DÙNG HỦY
            setPaymentStatus({
                type: 'info',
                message: 'Payment was cancelled.'
            });
        } else if (code) {
            // LỖI KHÁC
            setPaymentStatus({
                type: 'error',
                message: 'Payment failed. Please try again.'
            });
        }
    };

    if (responseCode) {
      handlePaymentResult(responseCode, orderIdFromVNPay);
    }

  }, [responseCode, orderIdFromVNPay, confirmPayment, refetch]); 


  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-center text-red-600 py-10">Error loading orders. Please refresh the page.</div>;

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800', 
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800' 
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h2 className="text-3xl font-heading font-bold text-primary mb-8">Your Orders</h2>

      {paymentStatus && (
        <div className={`p-4 rounded-md mb-6 border ${
            paymentStatus.type === 'success' 
            ? 'bg-green-50 border-green-300 text-green-800' 
            : paymentStatus.type === 'info'
            ? 'bg-blue-50 border-blue-300 text-blue-800' 
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
            <p className="font-semibold">{paymentStatus.message}</p>
        </div>
      )}

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
                    Order ID: <span className="text-primary">{order._id?.slice(-8).toUpperCase()}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  {order.ghnOrderCode && (
                      <div className="mt-2 inline-block bg-purple-50 px-3 py-1 rounded border border-purple-200">
                          <p className="text-sm text-purple-700 font-bold">
                              📦 Tracking Code: {order.ghnOrderCode}
                          </p>
                      </div>
                  )}
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-2xl font-heading font-bold text-ink">${order.totalPrice?.toFixed(2)}</p>
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
                    {order.address?.address}, {order.address?.city}, {order.address?.state}, {order.address?.country}
                  </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-subtle pt-4">
                <h4 className="font-heading text-md font-semibold text-ink mb-3">Items Ordered:</h4>
                <div className="space-y-3">
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
  );
};

export default OrderPage;