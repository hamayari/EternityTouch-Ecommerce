import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { FiUsers, FiShoppingBag, FiDollarSign, FiCheckCircle, FiClock, FiPackage } from 'react-icons/fi';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/order/dashboard-stats`,
        { headers: { token } }
      );
      if (response.data.success) {
        setStats(response.data.stats);
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load dashboard data</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': 'bg-blue-100 text-blue-800',
      'Packing': 'bg-yellow-100 text-yellow-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Out for delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Stats cards configuration
  const statsCards = [
    {
      title: "Total Revenue",
      count: `${currency}${stats.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-purple-400 to-purple-600",
      textColor: "text-purple-500"
    },
    {
      title: "Total Orders",
      count: stats.totalOrders.toLocaleString(),
      icon: <FiShoppingBag className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
      textColor: "text-blue-500"
    },
    {
      title: "Pending Orders",
      count: stats.pendingOrders.toLocaleString(),
      icon: <FiClock className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-amber-400 to-amber-600",
      textColor: "text-amber-500"
    },
    {
      title: "Delivered Orders",
      count: stats.deliveredOrders.toLocaleString(),
      icon: <FiCheckCircle className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-emerald-400 to-emerald-600",
      textColor: "text-emerald-500"
    },
    {
      title: "Total Users",
      count: stats.totalUsers.toLocaleString(),
      icon: <FiUsers className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-indigo-400 to-indigo-600",
      textColor: "text-indigo-500"
    },
    {
      title: "Total Products",
      count: stats.totalProducts.toLocaleString(),
      icon: <FiPackage className="w-8 h-8" />,
      bgColor: "bg-gradient-to-r from-pink-400 to-pink-600",
      textColor: "text-pink-500"
    }
  ];

  // Revenue Line Chart
  const revenueChartData = {
    labels: stats.revenueByMonth.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`),
    datasets: [
      {
        label: `Revenue (${currency})`,
        data: stats.revenueByMonth.map(item => item.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Orders by Status Doughnut Chart
  const orderStatusChartData = {
    labels: stats.ordersByStatus.map(item => item._id),
    datasets: [
      {
        data: stats.ordersByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Orders Bar Chart
  const ordersBarChartData = {
    labels: stats.revenueByMonth.map(item => `${monthNames[item._id.month - 1]}`),
    datasets: [
      {
        label: 'Number of Orders',
        data: stats.revenueByMonth.map(item => item.orders),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 15
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
        Forever E-Commerce Dashboard
      </h1>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                <div className="text-white">{stat.icon}</div>
              </div>
              <span className="text-sm font-semibold text-gray-600">{stat.title}</span>
            </div>
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
              {stat.count}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Line Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Revenue Trend</h2>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl" style={{ height: '300px' }}>
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders by Month</h2>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl" style={{ height: '300px' }}>
            <Bar data={ordersBarChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Status Distribution</h2>
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center" style={{ height: '300px' }}>
            <Doughnut data={orderStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Metrics</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                  <h3 className="text-4xl font-bold text-emerald-600 mt-2">
                    {stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%
                  </h3>
                </div>
                <FiCheckCircle className="w-16 h-16 text-emerald-500" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Average Order Value</p>
                  <h3 className="text-4xl font-bold text-indigo-600 mt-2">
                    {currency}{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                  </h3>
                </div>
                <FiDollarSign className="w-16 h-16 text-indigo-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Recent Orders</h3>
            <Link
              to="/order"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
            >
              View All 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.items.length} item(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {currency}{order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/add"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-4"
        >
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Add Product</h4>
            <p className="text-sm text-gray-600">Create new product</p>
          </div>
        </Link>

        <Link
          to="/list"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-4"
        >
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">View Products</h4>
            <p className="text-sm text-gray-600">Manage inventory</p>
          </div>
        </Link>

        <Link
          to="/order"
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 flex items-center space-x-4"
        >
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-full p-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Manage Orders</h4>
            <p className="text-sm text-gray-600">Process orders</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
