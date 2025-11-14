import React, { useState } from 'react';
import { useGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import Loading from '../../components/Loading';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';
import Swal from 'sweetalert2';

const Orders = () => {
  // --- (LOGIC GIỮ NGUYÊN) ---
  const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Order Status',
      input: 'select',
      inputOptions: {
        'Pending': 'Pending',
        'Processing': 'Processing',
        'Shipped': 'Shipped',
        'Delivered': 'Delivered',
        'Cancelled': 'Cancelled'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonColor: "#045D5D", // Màu primary
      cancelButtonColor: "#33312E", // Màu ink
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        setUpdatingOrderId(orderId);
        await axios.put(
          `${getBaseUrl()}/api/orders/${orderId}/status`,
          { status: newStatus },
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
        );
        Swal.fire({ title: 'Updated!', text: `Order status updated to ${newStatus}`, icon: 'success' });
        refetch();
      } catch (error) {
        Swal.fire({ title: 'Error!', text: 'Failed to update order status', icon: 'error' });
      } finally {
        setUpdatingOrderId(null);
      }
    }
  };
  // --- (KẾT THÚC LOGIC) ---

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg">
        <p className="font-bold">Failed to load orders</p>
        <p className="text-sm mt-2">{error?.data?.message || error?.message || "Unknown error"}</p>
      </div>
    );
  }

  // Cập nhật lại getStatusColor
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-accent-light text-accent' // Dùng màu accent
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    // --- SỬA GIAO DIỆN ---
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold text-ink">Orders Management</h1>
        <button
          onClick={refetch}
          className="inline-flex px-5 py-3 text-white bg-primary hover:bg-opacity-90 rounded-md shadow-sm transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {validOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white border border-subtle rounded-lg shadow-sm">
          <p className="text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {validOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-subtle">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
                <div>
                  <p className="text-lg font-heading font-bold text-ink">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.name} ({order.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    {/* (Đảm bảo có order.address.address) */}
                    <strong>Address:</strong> {order.address?.address}, {order.address?.city}, {order.address?.country}
                  </p>
                  <p className="text-sm text-gray-600"><strong>Phone:</strong> {order.phone}</p>
                </div>
                <div className="text-left sm:text-right mt-4 sm:mt-0">
                  <p className="text-2xl font-heading font-bold text-ink">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleUpdateStatus(order._id, order.status || 'Pending')}
                    disabled={updatingOrderId === order._id}
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.status || 'Pending')}`}
                  >
                    {updatingOrderId === order._id ? 'Updating...' : (order.status || 'Pending')}
                  </button>
                </div>
              </div>

              <div className="border-t border-subtle pt-4">
                <p className="font-medium text-ink mb-2">Items:</p>
                <div className="space-y-2">
                  {/* (Đã sửa để đọc từ order.items) */}
                  {order.items?.map((item, i) => (
                    <div key={item.productId || i} className="flex justify-between text-sm bg-paper p-2 rounded">
                      <span>
                        <strong className="text-ink">{item.title}</strong> × {item.quantity}
                      </span>
                      <span className="font-medium text-ink">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
    // --- KẾT THÚC SỬA GIAO DIỆN ---
  );
};

export default Orders;