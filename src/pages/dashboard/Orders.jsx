import React, { useState } from 'react';
import { useGetOrdersQuery } from '../../redux/features/orders/ordersApi';
import Loading from '../../components/Loading';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';
import Swal from 'sweetalert2';

const Orders = () => {
  const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // --- THÊM DÒNG NÀY ---
  // Lọc để chỉ lấy các đơn hàng hợp lệ (được tạo bằng model mới và có items)
  const validOrders = orders.filter(order => order.items && order.items.length > 0);
  // --- KẾT THÚC THÊM ---

  const handleUpdateStatus = async (orderId, currentStatus) => {
    // ... (Giữ nguyên nội dung hàm handleUpdateStatus) ...
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
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
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status!'
        }
      }
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        setUpdatingOrderId(orderId);
        await axios.put(
          `${getBaseUrl()}/api/orders/${orderId}/status`,
          { status: newStatus },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            }
          }
        );

        Swal.fire({
          title: 'Updated!',
          text: `Order status updated to ${newStatus}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        refetch();
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update order status',
          icon: 'error'
        });
      } finally {
        setUpdatingOrderId(null);
      }
    }
  };

  if (isLoading) return <Loading />;
  if (error) {
    // ... (Giữ nguyên phần xử lý lỗi) ...
    return (
      <div className="text-red-500 text-center p-6 bg-red-50 rounded-lg">
        <p className="font-bold">Failed to load orders</p>
        <p className="text-sm mt-2">{error?.data?.message || error?.message || "Unknown error"}</p>
        <button
          onClick={refetch}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

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

      {/* THAY THẾ 'orders.length' BẰNG 'validOrders.length' */}
      {validOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* THAY THẾ 'orders.map' BẰNG 'validOrders.map' */}
          {validOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-lg font-bold">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.name} ({order.email})
                  </p>
                  <p className="text-sm">
                    <strong>Address:</strong> {order.address?.city}, {order.address?.country}
                  </p>
                  <p className="text-sm"><strong>Phone:</strong> {order.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${order.totalPrice}</p>
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

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Items:</p>
                <div className="space-y-2">
                  {/* Đọc từ order.items (đã sửa ở bước trước) */}
                  {order.items?.map((item, i) => (
                    <div key={item.productId || i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>
                        <strong>{item.title}</strong> × {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
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