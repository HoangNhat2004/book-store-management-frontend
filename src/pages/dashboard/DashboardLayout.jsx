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
    // console.log(data)
    const navigate = useNavigate()
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response =  await axios.get(`${getBaseUrl()}/api/admin`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                })

                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchData();
    }, []);

    // console.log(data)

    if(loading) return <Loading/>

  return (
    <>
     <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Box 1: Products */}
              <div className="flex items-center p-8 bg-white shadow rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <span className="block text-2xl font-bold">{data?.totalBooks}</span>
                  <span className="block text-gray-500">Products</span>
                </div>
              </div>
              {/* Box 2: Total Sales */}
              <div className="flex items-center p-8 bg-white shadow rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <span className="block text-2xl font-bold">${(data?.totalSales || 0).toFixed(2)}</span>
                  <span className="block text-gray-500">Total Sales</span>
                </div>
              </div>
              {/* Box 3: Trending Books */}
              <div className="flex items-center p-8 bg-white shadow rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-red-600 bg-red-100 rounded-full mr-6">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <span className="inline-block text-2xl font-bold">{data?.trendingBooks}</span>
                  <span className="block text-gray-500">Trending Books</span>
                </div>
              </div>
              {/* Box 4: Total Orders */}
              <div className="flex items-center p-8 bg-white shadow rounded-lg">
                <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-blue-600 bg-blue-100 rounded-full mr-6">
                <MdIncompleteCircle className='size-6'/>
                </div>
                <div>
                  <span className="block text-2xl font-bold">{data?.totalOrders}</span>
                  <span className="block text-gray-500">Total Orders</span>
                </div>
              </div>
            </section>
            
            <section className="grid md:grid-cols-2 gap-6 mt-6">
              
              {/* CỘT 1: BIỂU ĐỒ DOANH THU */}
              <div className="flex flex-col bg-white shadow rounded-lg">
                <div className="px-6 py-5 font-semibold border-b border-gray-100">The number of orders per month</div>
                <div className="p-4 flex-grow">
                  <RevenueChart />
                </div>
              </div>

              {/* CỘT 2: USERS BY AVERAGE ORDER (DÙNG DỮ LIỆU THẬT) */}
              <div className="bg-white shadow rounded-lg">
                <div className="flex items-center justify-between px-6 py-5 font-semibold border-b border-gray-100">
                  <span>Top Users by Average Order</span>
                  <button type="button" className="inline-flex justify-center rounded-md px-1 -mr-1 bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-600" id="options-menu" aria-haspopup="true" aria-expanded="true">
                    Descending
                    <svg className="-mr-1 ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto" style={{maxHeight: '24rem'}}>
                  <ul className="p-6 space-y-6">
                    {
                       data.topUsers && data.topUsers.length > 0 ? (
                         data.topUsers.map((user, index) => (
                           <li key={user._id || index} className="flex items-center">
                             <div className="h-10 w-10 mr-3 bg-gray-100 rounded-full overflow-hidden">
                               <img 
                                src={user.photoURL || `https://randomuser.me/api/portraits/lego/${index % 9}.jpg`} 
                                alt={`${user.name} profile`}
                                className="h-full w-full object-cover"
                               />
                             </div>
                             <span className="text-gray-600">{user.name || user._id}</span>
                             <span className="ml-auto font-semibold">${user.averageOrderValue.toFixed(2)}</span>
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
            
            {/* --- BẮT ĐẦU THAY THẾ FOOTER --- */}
            <section className="text-center mt-6 font-semibold text-gray-500">
              <p>Book Store Management Project - Developed by Group SOA-132</p>
            </section>
            {/* --- KẾT THÚC THAY THẾ --- */}
    </>
  )
}

export default Dashboard