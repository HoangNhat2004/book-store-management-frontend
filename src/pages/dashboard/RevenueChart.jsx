import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = () => {
  // --- (LOGIC LẤY DATA GIỮ NGUYÊN) ---
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
        const monthlyRevenue = Array(12).fill(0);
        monthlySales.forEach(sale => {
          const month = parseInt(sale._id.split('-')[1]) - 1; 
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

  // --- SỬA LẠI DATA VÀ OPTIONS ---
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (USD)',
        data: revenueData,
        backgroundColor: 'rgba(4, 93, 93, 0.7)', // <-- SỬA MÀU (primary)
        borderColor: 'rgba(4, 93, 93, 1)', // <-- SỬA MÀU (primary)
        borderWidth: 1,
        borderRadius: 4, // Thêm bo góc
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Thêm để chiều cao linh hoạt
    plugins: {
      legend: {
        position: 'top',
        labels: {
            font: { family: 'Inter' } // Sửa font
        }
      },
      title: {
        display: false, // Tắt tiêu đề (đã có ở Dashboard.jsx)
      },
      tooltip: {
        backgroundColor: '#33312E', // Dùng màu 'ink'
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
            color: '#E8E4DD' // Dùng màu 'subtle'
        },
        ticks: {
            font: { family: 'Inter' }
        }
      },
      x: {
        grid: {
            display: false
        },
        ticks: {
            font: { family: 'Inter' }
        }
      }
    },
  };
  // --- KẾT THÚC SỬA ---

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    // Sửa lại container
    <div className="w-full h-80 md:h-96"> 
      <Bar data={data} options={options} />
    </div>
  );
};

export default RevenueChart;