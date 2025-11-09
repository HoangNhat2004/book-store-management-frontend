// src/pages/dashboard/Orders.jsx
import React from 'react';
import { useGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import Loading from '../../components/Loading';

const Orders = () => {
  const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery();

  if (isLoading) return <Loading />;
  if (error) return <div className="text-red-500 text-center p-6">Failed to load orders</div>;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-700">Orders Management</h1>
        <button
          onClick={refetch}
          className="inline-flex px-5 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})
                  </p>
                  <p className="text-sm"><strong>Address:</strong> {order.shippingAddress}</p>
                  <p className="text-sm"><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${order.totalAmount?.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Items:</p>
                <div className="space-y-1">
                  {order.books?.map((book, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{book.title || 'Unknown Book'} × {book.quantity}</span>
                      <span>${(book.price * book.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Orders;