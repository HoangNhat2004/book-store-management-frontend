import React, { useState } from 'react';
// Import thêm usePushToGHNMutation
import { useGetOrdersQuery, usePushToGHNMutation } from '../../redux/features/orders/ordersApi';
import { useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';
import Swal from 'sweetalert2';

const Orders = () => {
  const { data: orders = [], error, isLoading, refetch } = useGetOrdersQuery();
  const [pushToGHN] = usePushToGHNMutation(); // Hook đẩy đơn GHN
  
  const [searchParams] = useSearchParams(); 
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const validOrders = orders.filter(order => order.items && order.items.length > 0);

  const emailQuery = searchParams.get('email')?.toLowerCase() || "";
  
  const filteredOrders = validOrders.filter(order => {
      if (!emailQuery) return true; 
      return (
          (order.email?.toLowerCase() || "").includes(emailQuery) || 
          (order._id?.toLowerCase() || "").includes(emailQuery)
      );
  });

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
      confirmButtonColor: "#045D5D", 
      cancelButtonColor: "#33312E", 
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        setUpdatingOrderId(orderId);
        
        // --- SỬA TẠI ĐÂY: Dùng 'adminToken' ---
        const token = localStorage.getItem('adminToken'); 
        // --------------------------------------

        await axios.put(
          `${getBaseUrl()}/api/orders/${orderId}/status`,
          { status: newStatus },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        Swal.fire({ title: 'Updated!', text: `Order status updated to ${newStatus}`, icon: 'success' });
        refetch();
      } catch (error) {
        console.error("Update Status Error:", error);
        Swal.fire({ title: 'Error!', text: 'Failed to update order status', icon: 'error' });
      } finally {
        setUpdatingOrderId(null);
      }
    }
  };

  // --- HÀM XỬ LÝ ĐẨY ĐƠN SANG GHN ---
  const handleShipGHN = async (orderId) => {
      try {
          // Hiện loading
          Swal.fire({ title: 'Pushing to GHN...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          
          // Gọi API
          const res = await pushToGHN(orderId).unwrap();
          
          Swal.fire({ 
              title: 'Success!', 
              text: `Order pushed to GHN. Code: ${res.ghnCode}`, 
              icon: 'success' 
          });
      } catch (error) {
          console.error("GHN Push Error:", error);
          Swal.fire({ 
              title: 'Failed', 
              text: error?.data?.message || error?.data?.error || 'Could not push to GHN', 
              icon: 'error' 
          });
      }
  };
  // ----------------------------------

  if (isLoading) return <Loading />;
  if (error) return <div>Error loading orders.</div>;

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
        <h1 className="text-3xl font-heading font-bold text-ink">Orders Management</h1>
        <button
          onClick={refetch}
          className="inline-flex px-5 py-3 text-white bg-primary hover:bg-opacity-90 rounded-md shadow-sm transition-colors"
        >
          Refresh Orders
        </button>
      </div>

      {emailQuery && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-200 flex justify-between items-center">
              <span>Showing results for: <span className="font-bold">"{emailQuery}"</span></span>
              <button onClick={() => window.history.back()} className="text-sm underline hover:text-blue-900">Clear Search</button>
          </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white border border-subtle rounded-lg shadow-sm">
          <p className="text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-subtle">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4">
                <div>
                  <p className="text-lg font-heading font-bold text-ink">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.name} ({order.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {order.address?.address}, {order.address?.city}, {order.address?.country}
                  </p>
                  <p className="text-sm text-gray-600"><strong>Phone:</strong> {order.phone}</p>
                  
                  {/* --- HIỂN THỊ MÃ GHN NẾU ĐÃ SHIP --- */}
                  {order.ghnOrderCode && (
                      <p className="text-sm text-purple-700 font-bold mt-1">
                          GHN Code: {order.ghnOrderCode}
                      </p>
                  )}
                  {/* ----------------------------------- */}
                </div>
                
                <div className="text-left sm:text-right mt-4 sm:mt-0 flex flex-col items-end">
                  <p className="text-2xl font-heading font-bold text-ink">${order.totalPrice.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  
                  <div className="flex gap-2 mt-2">
                      {/* Nút Đổi Trạng Thái (Thủ công) */}
                      <button
                        onClick={() => handleUpdateStatus(order._id, order.status || 'Pending')}
                        disabled={updatingOrderId === order._id}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(order.status || 'Pending')}`}
                      >
                        {updatingOrderId === order._id ? 'Updating...' : (order.status || 'Pending')}
                      </button>

                      {/* --- NÚT SHIP GHN (Chỉ hiện khi chưa ship và không phải Cancelled) --- */}
                      {!order.ghnOrderCode && order.status === 'Processing' && (
                          <button
                            onClick={() => handleShipGHN(order._id)}
                            className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-600 transition-colors"
                          >
                            Ship (GHN)
                          </button>
                      )}
                      {/* ------------------------------------------------------------------ */}
                  </div>
                </div>
              </div>

              <div className="border-t border-subtle pt-4">
                <p className="font-medium text-ink mb-2">Items:</p>
                <div className="space-y-2">
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
  );
};

export default Orders;