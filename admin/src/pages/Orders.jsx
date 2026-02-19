import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [syncing, setSyncing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const itemsPerPage = 20;

  const fetchAllOrders = async (page = 1) => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('payment', paymentFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await axios.get(
        `${backendUrl}/api/order/list-paginated?${params.toString()}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination.pages);
        setTotalOrders(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      } else {
        toast.error(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const syncAllTracking = async () => {
    setSyncing(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/sync-tracking`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Tracking synchronized successfully');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to sync tracking');
    } finally {
      setSyncing(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Order status updated');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleTrackingChange = (orderId, field, value) => {
    setTrackingData(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value
      }
    }));
  };

  const addTrackingNumber = async (orderId) => {
    const data = trackingData[orderId];
    if (!data?.trackingNumber || !data?.courier) {
      toast.error('Please enter tracking number and select courier');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/add-tracking`,
        { 
          orderId, 
          trackingNumber: data.trackingNumber, 
          courier: data.courier 
        },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success('Tracking number added successfully');
        await fetchAllOrders();
        setTrackingData(prev => ({ ...prev, [orderId]: {} }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add tracking');
    }
  };

  useEffect(() => {
    fetchAllOrders(currentPage);
  }, [token, currentPage, statusFilter, paymentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAllOrders(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Order Placed': 'primary',
      Packing: 'warning',
      Shipped: 'info',
      'Out for delivery': 'secondary',
      Delivered: 'success'
    };
    return badges[status] || 'secondary';
  };

  const getPaymentBadge = (payment) => {
    return payment ? 'success' : 'danger';
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

  return (
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <Card.Title as="h5">Order Management</Card.Title>
                <span className="d-block m-t-5">
                  Total <Badge bg="primary">{totalOrders}</Badge> orders
                </span>
              </div>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={syncAllTracking}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <i className="feather icon-refresh-cw me-2" />
                    Sync Tracking
                  </>
                )}
              </Button>
            </div>

            {/* Filters */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for delivery">Out for delivery</option>
                  <option value="Delivered">Delivered</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Payments</option>
                  <option value="true">Paid</option>
                  <option value="false">Unpaid</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="primary" onClick={handleSearch} className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            {orders.length === 0 ? (
              <div className="text-center py-5">
                <i className="feather icon-shopping-cart" style={{ fontSize: '48px', color: '#ccc' }} />
                <p className="text-muted mt-3">No orders found</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <React.Fragment key={order._id}>
                        <tr>
                          <td>
                            <strong>#{order._id.slice(-8)}</strong>
                          </td>
                          <td>
                            <div>
                              <h6 className="mb-1">{order.address.firstName + ' ' + order.address.lastName}</h6>
                              <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                                <i className="feather icon-phone me-1" />
                                {order.address.phone}
                              </p>
                              <p className="text-muted mb-0" style={{ fontSize: '11px' }}>
                                {order.address.street}, {order.address.city}
                              </p>
                            </div>
                          </td>
                          <td>
                            <div>
                              {order.items.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="mb-1" style={{ fontSize: '12px' }}>
                                  • {item.name} x{item.quantity} ({item.size})
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <Badge bg="secondary" className="mt-1">
                                  +{order.items.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong className="text-primary">
                              {currency}
                              {order.amount}
                            </strong>
                          </td>
                          <td>
                            <Badge bg={getPaymentBadge(order.payment)}>{order.payment ? 'Paid' : 'Pending'}</Badge>
                          </td>
                          <td>
                            <Badge bg="info">{order.paymentMethod}</Badge>
                          </td>
                          <td style={{ fontSize: '12px' }}>{new Date(order.date).toLocaleDateString()}</td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={order.status}
                              onChange={(event) => statusHandler(event, order._id)}
                              className={`text-${getStatusBadge(order.status)}`}
                              style={{ fontWeight: '600', minWidth: '150px' }}
                            >
                              <option value="Order Placed">Order Placed</option>
                              <option value="Packing">Packing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for delivery">Out for delivery</option>
                              <option value="Delivered">Delivered</option>
                            </Form.Select>
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant={expandedOrder === order._id ? "secondary" : "outline-primary"}
                              onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            >
                              <i className={`feather icon-${expandedOrder === order._id ? 'minus' : 'plus'}`} />
                            </Button>
                          </td>
                        </tr>
                        {expandedOrder === order._id && (
                          <tr>
                            <td colSpan="9" className="bg-light">
                              <div className="p-3">
                                <h6 className="mb-3">
                                  <i className="feather icon-truck me-2" />
                                  Tracking Information
                                </h6>
                                {order.trackingNumber ? (
                                  <div className="alert alert-success">
                                    <p className="mb-1">
                                      <strong>Tracking Number:</strong> {order.trackingNumber}
                                    </p>
                                    <p className="mb-1">
                                      <strong>Courier:</strong> {order.courier?.toUpperCase()}
                                    </p>
                                    {order.trackingUrl && (
                                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-2">
                                        Track on Carrier Site
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <Row className="g-2">
                                      <Col md={4}>
                                        <Form.Group>
                                          <Form.Label className="small">Tracking Number</Form.Label>
                                          <Form.Control
                                            size="sm"
                                            type="text"
                                            placeholder="Enter tracking number"
                                            value={trackingData[order._id]?.trackingNumber || ''}
                                            onChange={(e) => handleTrackingChange(order._id, 'trackingNumber', e.target.value)}
                                          />
                                        </Form.Group>
                                      </Col>
                                      <Col md={3}>
                                        <Form.Group>
                                          <Form.Label className="small">Courier</Form.Label>
                                          <Form.Select
                                            size="sm"
                                            value={trackingData[order._id]?.courier || ''}
                                            onChange={(e) => handleTrackingChange(order._id, 'courier', e.target.value)}
                                          >
                                            <option value="">Select courier</option>
                                            <option value="dhl">DHL</option>
                                            <option value="fedex">FedEx</option>
                                            <option value="ups">UPS</option>
                                            <option value="usps">USPS</option>
                                            <option value="colissimo">Colissimo</option>
                                            <option value="laposte">La Poste</option>
                                            <option value="chronopost">Chronopost</option>
                                            <option value="dpd">DPD</option>
                                          </Form.Select>
                                        </Form.Group>
                                      </Col>
                                      <Col md={2} className="d-flex align-items-end">
                                        <Button 
                                          size="sm" 
                                          variant="success"
                                          onClick={() => addTrackingNumber(order._id)}
                                        >
                                          Add Tracking
                                        </Button>
                                      </Col>
                                    </Row>
                                    <div className="alert alert-info mt-3 mb-0">
                                      <small>
                                        <i className="feather icon-info me-1" />
                                        Add tracking number to enable real-time delivery tracking for customers
                                      </small>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                    <div className="text-muted">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="feather icon-chevron-left" /> Previous
                      </Button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'primary' : 'outline-primary'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next <i className="feather icon-chevron-right" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Orders;
