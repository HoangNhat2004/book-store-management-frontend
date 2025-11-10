// src/pages/books/OrderPage.jsx
import React from 'react';
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';

const OrderPage = () => {
  const { currentUser } = useAuth();
  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email);

  if (isLoading) return <div className="text-center py-20">Loading orders...</div>;
  if (isError) return <div className="text-center text-red-600 py-20">Error loading orders</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h2 className="text-3xl font-bold text-purple-700 mb-8 text-center">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600">No orders found!</p>
          <p className="text-sm mt-2">Start shopping to see your orders here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order, index) => (
            <div key={order._id} className="bg-white p-6 rounded-xl shadow-lg border">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                    Order #{index + 1}
                  </span>
                  <p className="text-lg font-bold mt-2">ID: {order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${order.totalPrice}</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mt-2">
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6 text-sm mb-6">
                <div>
                  <p><strong>Name:</strong> {order.name}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Phone:</strong> {order.phone}</p>
                </div>
                <div>
                  <p><strong>Shipping Address:</strong></p>
                  <p className="text-gray-600">
                    {order.address?.city}, {order.address?.state}, {order.address?.country}
                    {order.address?.zipcode && ` - ${order.address.zipcode}`}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Items Ordered:</h3>
                <div className="space-y-3">
                  {order.productIds?.map((product, i) => (
                    <div key={product._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        {product.coverImage ? (
                          <img 
                            src={product.coverImage} 
                            alt={product.title} 
                            className="w-16 h-20 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">No image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: <strong>{order.quantities?.[i] || 1}</strong>
                          </p>
                        </div>
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
  );
};

export default OrderPage;