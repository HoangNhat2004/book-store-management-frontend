import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import getBaseUrl from '../../utils/baseURL';
import { MdIncompleteCircle } from 'react-icons/md'
import RevenueChart from './RevenueChart';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // --- SỬA: Lấy adminToken ---
                const token = localStorage.getItem('adminToken');
                if(!token) {
                    navigate('/admin');
                    return;
                }

                const response = await axios.get(`${getBaseUrl()}/api/admin`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                setData(response.data);
            } catch (error) {
                console.error('Error:', error);
                if(error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminUser');
                    navigate('/admin');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [navigate]);

    if(loading) return <Loading/>

  return (
    <>
      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Box 1: Products */}
              <div className="flex items-center p-6 bg-white shadow-sm border border-subtle rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-primary bg-primary/10 rounded-full mr-6">
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-heading text-ink">{data?.totalBooks}</span>
                  <span className="block text-gray-500">Products</span>
                </div>
              </div>

              {/* Box 2: Total Sales */}
              <div className="flex items-center p-6 bg-white shadow-sm border border-subtle rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-heading text-ink">${(data?.totalSales || 0).toFixed(2)}</span>
                  <span className="block text-gray-500">Total Sales</span>
                </div>
              </div>

              {/* Box 3: Trending Books */}
              <div className="flex items-center p-6 bg-white shadow-sm border border-subtle rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-accent bg-accent-light rounded-full mr-6">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <span className="inline-block text-2xl font-bold font-heading text-ink">{data?.trendingBooks}</span>
                  <span className="block text-gray-500">Trending Books</span>
                </div>
              </div>

              {/* Box 4: Total Orders */}
              <div className="flex items-center p-6 bg-white shadow-sm border border-subtle rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-blue-600 bg-blue-100 rounded-full mr-6">
                <MdIncompleteCircle className='size-6'/>
                </div>
                <div>
                  <span className="block text-2xl font-bold font-heading text-ink">{data?.totalOrders}</span>
                  <span className="block text-gray-500">Total Orders</span>
                </div>
              </div>
            </section>
            
            <section className="grid md:grid-cols-3 gap-6 mt-6">
              
              {/* CỘT 1: BIỂU ĐỒ DOANH THU */}
              <div className="md:col-span-2 flex flex-col bg-white shadow-sm border border-subtle rounded-lg">
                <div className="px-6 py-5 font-semibold font-heading text-ink border-b border-subtle">
                  Monthly Revenue
                </div>
                <div className="p-4 flex-grow">
                  <RevenueChart monthlySales={data?.monthlySales} />
                </div>
              </div>

              {/* CỘT 2: TOP USERS */}
              <div className="bg-white shadow-sm border border-subtle rounded-lg">
                <div className="flex items-center justify-between px-6 py-5 font-semibold font-heading text-ink border-b border-subtle">
                  <span>Top Users by Average Order</span>
                </div>
                <div className="overflow-y-auto" style={{maxHeight: '24rem'}}>
                  <ul className="p-6 space-y-6">
                    {
                       data.topUsers && data.topUsers.length > 0 ? (
                         data.topUsers.map((user, index) => (
                           <li key={user.email || index} className="flex items-center">
                             <div className="h-10 w-10 mr-3 bg-gray-100 rounded-full overflow-hidden border border-subtle">
                               <img 
                                src={user.photoURL || `https://randomuser.me/api/portraits/lego/${index % 9}.jpg`} 
                                alt={`${user.name} profile`}
                                className="h-full w-full object-cover"
                               />
                             </div>
                             <div className='flex-1 min-w-0'>
                                 <p className="text-sm font-medium text-ink truncate">{user.name || user.email}</p>
                                 <p className="text-xs text-gray-500">{user.totalOrders} orders</p>
                             </div>
                             <span className="ml-auto font-heading font-bold text-primary">${user.averageOrderValue.toFixed(2)}</span>
                           </li>
                         ))
                       ) : (
                         <li className="text-gray-500 text-center">No user data available.</li>
                       )
                     }
                  </ul>
                </div>
              </div>
            </section>
            
            <section className="text-center mt-8 font-semibold text-gray-400">
              <p>Book Store Management Project - Developed by Group SOA-132</p>
            </section>
    </>
  )
}

export default Dashboard