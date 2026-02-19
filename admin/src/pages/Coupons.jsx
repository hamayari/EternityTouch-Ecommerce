import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Coupons = ({ token }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: ''
  });

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/coupon/list`, { headers: { token } });
      if (response.data.success) {
        setCoupons(response.data.coupons);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch coupons');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCoupons();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/create`,
        formData,
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Coupon created successfully');
        setShowModal(false);
        setFormData({
          code: '',
          type: 'percentage',
          value: '',
          minPurchase: '',
          maxDiscount: '',
          expiryDate: '',
          usageLimit: ''
        });
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to create coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/delete`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Coupon deleted');
        fetchCoupons();
      }
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/toggle-status`,
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCoupons();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (coupon) => {
    if (!coupon.isActive) return <Badge bg="secondary">Inactive</Badge>;
    if (new Date() > new Date(coupon.expiryDate)) return <Badge bg="danger">Expired</Badge>;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return <Badge bg="warning">Limit Reached</Badge>;
    return <Badge bg="success">Active</Badge>;
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title as="h5">Coupon Management</Card.Title>
                <span className="d-block m-t-5">
                  Total <Badge bg="primary">{coupons.length}</Badge> coupons
                </span>
              </div>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <i className="feather icon-plus me-2"></i>
                Create Coupon
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {coupons.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No coupons found</p>
              </div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Purchase</th>
                    <th>Usage</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td><strong>{coupon.code}</strong></td>
                      <td>
                        <Badge bg={coupon.type === 'percentage' ? 'info' : 'warning'}>
                          {coupon.type === 'percentage' ? 'Percentage' : 'Fixed'}
                        </Badge>
                      </td>
                      <td>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                        {coupon.maxDiscount && <small className="text-muted d-block">Max: ${coupon.maxDiscount}</small>}
                      </td>
                      <td>${coupon.minPurchase}</td>
                      <td>
                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                      </td>
                      <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(coupon)}</td>
                      <td>
                        <Button
                          variant={coupon.isActive ? 'warning' : 'success'}
                          size="sm"
                          className="me-2"
                          onClick={() => handleToggleStatus(coupon._id)}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(coupon._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Create Coupon Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Coupon</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Coupon Code *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., SUMMER2026"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type *</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Value *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={formData.type === 'percentage' ? '10' : '50'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                  <Form.Text className="text-muted">
                    {formData.type === 'percentage' ? 'Percentage (0-100)' : 'Fixed amount in dollars'}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Purchase</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Discount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                  <Form.Text className="text-muted">For percentage coupons</Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Usage Limit</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Coupon
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Row>
  );
};

export default Coupons;
