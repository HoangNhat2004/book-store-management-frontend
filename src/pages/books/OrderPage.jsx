// src/pages/books/OrderPage.jsx
import React from 'react';
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';

const OrderPage = () => {
  const { currentUser } = useAuth();

  const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email);

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError) return <div className="text-center text-red-600 py-10">Error loading orders</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-3xl font-bold text-purple-700 mb-8">Your Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No orders found!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
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
                  <p className="text-2xl font-bold text-green-600">${order.totalPrice}</p>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mt-2">
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
                  {order.productIds?.map((product, i) => (
                    product ? (
                      <div key={product._id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                          <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-xs text-gray-600">Quantity: {order.quantities?.[i] || 1}</p>
                          </div>
                        <p className="font-medium text-green-600">
                          ${(product.newPrice * (order.quantities?.[i] || 1)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      // Hiển thị nếu sản phẩm đã bị xóa
                      <div key={i} className="flex justify-between items-center bg-red-50 p-3 rounded">
                        <div>
                          <p className="font-medium text-red-700 italic">[Sản phẩm đã bị xóa]</p>
                          <p className="text-xs text-gray-600">Quantity: {order.quantities?.[i] || 1}</p>
                        </div>
                      </div>
                    )
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