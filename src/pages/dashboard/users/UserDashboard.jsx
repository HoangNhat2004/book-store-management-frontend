// src/pages/dashboard/users/UserDashboard.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGetOrderByEmailQuery } from '../../../redux/features/orders/ordersApi';
import getImgUrl from '../../../utils/getImgUrl';

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email);

  if (isLoading) return <div className="text-center py-20">Loading...</div>;
  if (isError) return <div className="text-center text-red-600 py-20">Error loading orders</div>;

  return (
    <div className="bg-gray-100 py-16 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">User Dashboard</h1>
        <p className="text-gray-700 mb-8">
          Welcome, <span className="font-semibold">{currentUser?.displayName || currentUser?.email}</span>! Here are your recent orders:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Recent Orders</h2>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-lg text-gray-600">You haven't placed any orders yet.</p>
              <p className="text-sm text-gray-500 mt-2">Start shopping to see your orders here!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Order ID: <span className="font-mono">{order._id.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${order.totalPrice}</p>
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mt-2">
                        {order.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-medium text-gray-800 mb-3">Items:</p>
                    <div className="space-y-3">
                      {order.productIds?.map((product, i) => (
                        <div key={product._id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                          {product.coverImage ? (
                            <img
                              src={getImgUrl(product.coverImage)}
                              alt={product.title}
                              className="w-14 h-20 object-cover rounded-md shadow-sm"
                              onError={(e) => { e.target.src = '/placeholder-book.jpg'; e.target.onerror = null;}}
                            />
                          ) : (
                            <div className="w-14 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                              <span className="text-xs text-gray-500">No img</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: <strong>{order.quantities?.[i] || 1}</strong>
                            </p>
                          </div>
                          <p className="font-semibold text-green-600">
                            ${(product.newPrice * (order.quantities?.[i] || 1)).toFixed(2)}
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
      </div>
    </div>
  );
};

export default UserDashboard;