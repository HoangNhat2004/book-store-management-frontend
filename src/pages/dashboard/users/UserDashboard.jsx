// src/pages/dashboard/users/UserDashboard.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGetOrderByEmailQuery } from '../../../redux/features/orders/ordersApi';
import { Link } from 'react-router-dom'; // Import Link

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email);

  // Lọc đơn hàng lỗi
  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  if (isLoading) return <div className="text-center py-20">Loading...</div>; // (Sẽ thay)
  if (isError) return <div className="text-center text-red-600 py-20">Error loading orders</div>;

  // Hàm helper để lấy màu status
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-accent-light text-accent' // Sửa thành màu accent
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-paper py-16 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-subtle rounded-xl p-8">
        <h1 className="text-3xl font-heading font-bold text-primary mb-2">User Dashboard</h1>
        <p className="text-gray-700 mb-8">
          Welcome, <span className="font-semibold text-ink">{currentUser?.displayName || currentUser?.email}</span>! Here are your recent orders:
        </p>

        <div className="bg-paper p-6 rounded-lg border border-subtle">
          <h2 className="text-xl font-heading font-semibold text-ink mb-6">Your Recent Orders</h2>

          {validOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-subtle">
              <p className="text-lg text-gray-600">You haven't placed any orders yet.</p>
              <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here!</p>
              <Link to="/" className="btn-primary mt-6 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {validOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-subtle">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Order ID: <span className="font-mono">{order._id.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
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

                  <div className="border-t border-subtle pt-4">
                    <p className="font-medium text-ink mb-3">Items:</p>
                    <div className="space-y-3">
                      {/* --- SỬA LẠI VÒNG LẶP --- */}
                      {order.items?.map((item, i) => (
                        <div key={item.productId || i} className="flex items-center justify-between gap-4 bg-paper p-3 rounded-lg">
                            <div>
                                <p className="font-medium text-ink">{item.title}</p>
                                <p className="text-sm text-gray-600">
                                Quantity: <strong>{item.quantity}</strong>
                                </p>
                            </div>
                          <p className="font-semibold text-ink">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {/* --- KẾT THÚC SỬA --- */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;