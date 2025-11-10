import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${getBaseUrl()}/api/admin`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        const monthlySales = response.data.monthlySales || [];
        
        // Tạo mảng 12 tháng với giá trị mặc định là 0
        const monthlyRevenue = Array(12).fill(0);
        
        // Điền dữ liệu từ backend
        monthlySales.forEach(sale => {
          const month = parseInt(sale._id.split('-')[1]) - 1; // Convert "2025-01" -> 0
          if (month >= 0 && month < 12) {
            monthlyRevenue[month] = sale.totalSales;
          }
        });

        setRevenueData(monthlyRevenue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (USD)',
        data: revenueData,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
        <div className="text-center py-10">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">Monthly Revenue</h2>
      <div className='hidden md:block'>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueChart;