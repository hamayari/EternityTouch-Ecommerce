import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/product/single`, { productId: id });
      if (response.data.success) {
        const product = response.data.product;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setBestseller(product.bestseller);
        setSizes(product.sizes);
        setExistingImages(product.image);
        setLoading(false);
      } else {
        toast.error(response.data.message);
        navigate('/list');
      }
    } catch (error) {
      console.error('[Fetch Product Error]:', error);
      toast.error(error.message);
      navigate('/list');
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append('productId', id);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(`${backendUrl}/api/product/update`, formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('[Update Product Error]:', error);
      toast.error(error.message);
    }
  };

  const toggleSize = (size) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]));
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
            <Card.Title as="h5">Edit Product</Card.Title>
            <span className="d-block m-t-5 text-muted">Update product information</span>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={onSubmitHandler}>
              <Form.Group className="mb-4">
                <Form.Label>Product Images</Form.Label>
                <p className="text-muted small mb-3">Upload new images to replace existing ones (optional)</p>
                <Row>
                  <Col xs={6} md={3} className="mb-3">
                    <Form.Label htmlFor="image1" style={{ cursor: 'pointer' }}>
                      <img
                        className="img-thumbnail"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        src={!image1 ? existingImages[0] || assets.upload_area : URL.createObjectURL(image1)}
                        alt="Product"
                      />
                      <Form.Control
                        onChange={(e) => setImage1(e.target.files[0])}
                        type="file"
                        id="image1"
                        hidden
                        accept="image/*"
                      />
                    </Form.Label>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <Form.Label htmlFor="image2" style={{ cursor: 'pointer' }}>
                      <img
                        className="img-thumbnail"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        src={!image2 ? existingImages[1] || assets.upload_area : URL.createObjectURL(image2)}
                        alt="Product"
                      />
                      <Form.Control
                        onChange={(e) => setImage2(e.target.files[0])}
                        type="file"
                        id="image2"
                        hidden
                        accept="image/*"
                      />
                    </Form.Label>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <Form.Label htmlFor="image3" style={{ cursor: 'pointer' }}>
                      <img
                        className="img-thumbnail"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        src={!image3 ? existingImages[2] || assets.upload_area : URL.createObjectURL(image3)}
                        alt="Product"
                      />
                      <Form.Control
                        onChange={(e) => setImage3(e.target.files[0])}
                        type="file"
                        id="image3"
                        hidden
                        accept="image/*"
                      />
                    </Form.Label>
                  </Col>
                  <Col xs={6} md={3} className="mb-3">
                    <Form.Label htmlFor="image4" style={{ cursor: 'pointer' }}>
                      <img
                        className="img-thumbnail"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        src={!image4 ? existingImages[3] || assets.upload_area : URL.createObjectURL(image4)}
                        alt="Product"
                      />
                      <Form.Control
                        onChange={(e) => setImage4(e.target.files[0])}
                        type="file"
                        id="image4"
                        hidden
                        accept="image/*"
                      />
                    </Form.Label>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter product name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Product Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Kids">Kids</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sub Category</Form.Label>
                    <Form.Select value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
                      <option value="Topwear">Topwear</option>
                      <option value="Bottomwear">Bottomwear</option>
                      <option value="Winterwear">Winterwear</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="25"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Product Sizes</Form.Label>
                <div className="d-flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <Button
                      key={size}
                      variant={sizes.includes(size) ? 'primary' : 'outline-secondary'}
                      onClick={() => toggleSize(size)}
                      type="button"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  id="bestseller"
                  label="Add to bestseller"
                  checked={bestseller}
                  onChange={() => setBestseller((prev) => !prev)}
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="primary" type="submit" size="lg">
                  <i className="feather icon-check me-2" />
                  Update Product
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/list')}>
                  <i className="feather icon-x me-2" />
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Edit;
