import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Image } from 'react-bootstrap';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ token }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  const fetchList = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/product/list-paginated?page=${page}&limit=${itemsPerPage}`
      );
      if (response.data.success) {
        setList(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setTotalProducts(response.data.pagination.total);
        setCurrentPage(response.data.pagination.page);
      } else {
        toast.error(response.data.message);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList(currentPage);
  }, [currentPage]);

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList(currentPage);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

  return (
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <Card.Title as="h5">All Products</Card.Title>
            <span className="d-block m-t-5">
              Total <Badge bg="primary">{totalProducts}</Badge> products
            </span>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Sub Category</th>
                  <th>Price</th>
                  <th>Bestseller</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <p className="text-muted mb-0">No products found</p>
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <Image
                          src={item.images?.[0] || 'default-image-url'}
                          alt={item.name}
                          rounded
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <h6 className="mb-1">{item.name}</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                          {item.description?.substring(0, 50)}...
                        </p>
                      </td>
                      <td>
                        <Badge bg="info">{item.category}</Badge>
                      </td>
                      <td>
                        <Badge bg="secondary">{item.subCategory}</Badge>
                      </td>
                      <td className="fw-bold">
                        {currency}
                        {item.price}
                      </td>
                      <td>
                        {item.bestseller ? (
                          <Badge bg="success">
                            <i className="feather icon-star me-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge bg="light" text="dark">
                            No
                          </Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/edit/${item._id}`)}
                        >
                          <i className="feather icon-edit" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => removeProduct(item._id)}>
                          <i className="feather icon-trash-2" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
                <div className="text-muted">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
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
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default List;
