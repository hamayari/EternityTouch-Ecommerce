import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/dashboard-stats`, {
        headers: { token }
      });
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Unable to load dashboard data</p>
      </div>
    );
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Revenue Chart Configuration
  const revenueChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    xaxis: {
      categories: stats.revenueByMonth.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`)
    },
    colors: ['#4680ff'],
    tooltip: {
      y: {
        formatter: (val) => `${currency}${val.toLocaleString()}`
      }
    }
  };

  const revenueChartSeries = [
    {
      name: 'Revenue',
      data: stats.revenueByMonth.map(item => item.revenue)
    }
  ];

  // Orders Chart Configuration
  const ordersChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '50%'
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: stats.revenueByMonth.map(item => monthNames[item._id.month - 1])
    },
    colors: ['#0e9e4a'],
    tooltip: {
      y: {
        formatter: (val) => `${val} orders`
      }
    }
  };

  const ordersChartSeries = [
    {
      name: 'Orders',
      data: stats.revenueByMonth.map(item => item.orders)
    }
  ];

  // Order Status Donut Chart
  const statusChartOptions = {
    chart: {
      type: 'donut',
      height: 300
    },
    labels: stats.ordersByStatus.map(item => item._id),
    colors: ['#4680ff', '#ff5252', '#9ccc65', '#ffa726', '#26c6da'],
    legend: {
      position: 'bottom'
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };

  const statusChartSeries = stats.ordersByStatus.map(item => item.count);

  const getStatusBadge = (status) => {
    const badges = {
      'Order Placed': 'bg-primary',
      'Packing': 'bg-warning',
      'Shipped': 'bg-info',
      'Out for delivery': 'bg-secondary',
      'Delivered': 'bg-success'
    };
    return badges[status] || 'bg-secondary';
  };

  return (
    <>
      <Row>
        <Col md={6} xl={3}>
          <Card className="bg-c-blue order-card">
            <Card.Body>
              <h6 className="text-white">Total Revenue</h6>
              <h2 className="text-end text-white">
                <i className="feather icon-dollar-sign float-start" />
                <span>{currency}{stats.totalRevenue.toLocaleString()}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="bg-c-green order-card">
            <Card.Body>
              <h6 className="text-white">Total Orders</h6>
              <h2 className="text-end text-white">
                <i className="feather icon-shopping-cart float-start" />
                <span>{stats.totalOrders.toLocaleString()}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="bg-c-yellow order-card">
            <Card.Body>
              <h6 className="text-white">Pending Orders</h6>
              <h2 className="text-end text-white">
                <i className="feather icon-clock float-start" />
                <span>{stats.pendingOrders.toLocaleString()}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} xl={3}>
          <Card className="bg-c-red order-card">
            <Card.Body>
              <h6 className="text-white">Total Products</h6>
              <h2 className="text-end text-white">
                <i className="feather icon-package float-start" />
                <span>{stats.totalProducts.toLocaleString()}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} xl={8}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Revenue Trend</Card.Title>
            </Card.Header>
            <Card.Body>
              <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height={350} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} xl={4}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Order Status</Card.Title>
            </Card.Header>
            <Card.Body>
              <Chart options={statusChartOptions} series={statusChartSeries} type="donut" height={300} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} xl={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Orders by Month</Card.Title>
            </Card.Header>
            <Card.Body>
              <Chart options={ordersChartOptions} series={ordersChartSeries} type="bar" height={350} />
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} xl={6}>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Performance Metrics</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row className="text-center">
                <Col>
                  <h3 className="text-success">
                    {stats.totalOrders > 0 ? Math.round((stats.deliveredOrders / stats.totalOrders) * 100) : 0}%
                  </h3>
                  <p className="text-muted mb-0">Completion Rate</p>
                </Col>
                <Col>
                  <h3 className="text-primary">
                    {currency}{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                  </h3>
                  <p className="text-muted mb-0">Avg Order Value</p>
                </Col>
                <Col>
                  <h3 className="text-info">{stats.totalUsers.toLocaleString()}</h3>
                  <p className="text-muted mb-0">Total Users</p>
                </Col>
              </Row>
              <hr />
              <div className="mt-4">
                <h6>Quick Actions</h6>
                <div className="d-grid gap-2">
                  <Link to="/add" className="btn btn-primary">
                    <i className="feather icon-plus me-2" />
                    Add New Product
                  </Link>
                  <Link to="/list" className="btn btn-success">
                    <i className="feather icon-list me-2" />
                    View All Products
                  </Link>
                  <Link to="/order" className="btn btn-warning">
                    <i className="feather icon-shopping-cart me-2" />
                    Manage Orders
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <Card.Title as="h5">Recent Orders</Card.Title>
              <Link to="/order" className="btn btn-sm btn-primary float-end">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{order.items.length} item(s)</td>
                      <td className="fw-bold">{currency}{order.amount}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
                      </td>
                      <td>{new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
