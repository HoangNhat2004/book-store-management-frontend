import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import getBaseUrl from '../../utils/baseURL';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RevenueChart = () => {
  const [revenueData, setRevenueData] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- SỬA LẠI: Dùng 'token' ---
        const token = localStorage.getItem('adminToken');
        // -----------------------------
        
        const response = await axios.get(`${getBaseUrl()}/api/admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const monthlySales = response.data.monthlySales || [];
        const monthlyRevenue = Array(12).fill(0);

        monthlySales.forEach(sale => {
          if (sale._id) {
            const month = parseInt(sale._id.split('-')[1]) - 1; 
            if (month >= 0 && month < 12) {
              monthlyRevenue[month] = sale.totalSales;
            }
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
        backgroundColor: 'rgba(4, 93, 93, 0.7)', // Primary color
        borderColor: 'rgba(4, 93, 93, 1)',       // Primary color
        borderWidth: 1,
        borderRadius: 4, 
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
            font: { family: 'Inter, sans-serif' } 
        }
      },
      title: {
        display: false, 
      },
      tooltip: {
        backgroundColor: '#33312E', 
        titleFont: { family: 'Inter, sans-serif', weight: 'bold' },
        bodyFont: { family: 'Inter, sans-serif' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
            color: '#E8E4DD' 
        },
        ticks: {
            font: { family: 'Inter, sans-serif' }
        }
      },
      x: {
        grid: {
            display: false
        },
        ticks: {
            font: { family: 'Inter, sans-serif' }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="text-gray-500 animate-pulse">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 md:h-96 bg-white p-4 rounded-lg"> 
      <Bar data={data} options={options} />
    </div>
  );
};

export default RevenueChart;