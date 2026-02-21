import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { getSizesByCategory, requiresShoeSizes } from '../utils/sizeHelper';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategoy] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [stock, setStock] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [availableSizes, setAvailableSizes] = useState(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
  const [isShoeSizes, setIsShoeSizes] = useState(false);
  const [ageGroup, setAgeGroup] = useState('adulte'); // For shoes: 'enfant' or 'adulte'

  // Update available sizes when category/subcategory changes
  useEffect(() => {
    const isShoe = requiresShoeSizes(category, subCategory);
    setIsShoeSizes(isShoe);
    
    if (isShoe) {
      const shoeSizes = getSizesByCategory(category, subCategory);
      setAvailableSizes(shoeSizes.adulte); // Default to adult sizes
      setAgeGroup('adulte');
    } else {
      setAvailableSizes(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);
    }
    
    // Reset selected sizes when category changes
    setSizes([]);
  }, [category, subCategory]);

  // Handle age group change for shoes
  const handleAgeGroupChange = (group) => {
    setAgeGroup(group);
    const shoeSizes = getSizesByCategory(category, subCategory);
    setAvailableSizes(shoeSizes[group]);
    setSizes([]); // Reset selected sizes
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('stock', stock || 0);
      formData.append('discount', discount || 0);
      if (discountEndDate) {
        formData.append('discountEndDate', discountEndDate);
      }

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);

      const response = await axios.post(backendUrl + '/api/product/add', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setDescription('');
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice('');
        setSizes([]);
        setBestseller(false);
        setStock('');
        setDiscount('');
        setDiscountEndDate('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('[Add Product Error]:', error);
      toast.error(error.message);
    }
  };

  const toggleSize = (size) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]));
  };

  return (
    <Row>
      <Col>
        <Card>
          <Card.Header>
            <Card.Title as="h5">Add New Product</Card.Title>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={onSubmitHandler}>
              <Form.Group className="mb-4">
                <Form.Label>Product Images</Form.Label>
                <Row>
                  <Col xs={6} md={3} className="mb-3">
                    <Form.Label htmlFor="image1" style={{ cursor: 'pointer' }}>
                      <img
                        className="img-thumbnail"
                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
                        alt="Upload"
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
                        src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
                        alt="Upload"
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
                        src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
                        alt="Upload"
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
                        src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
                        alt="Upload"
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
                    <Form.Select value={subCategory} onChange={(e) => setSubCategoy(e.target.value)}>
                      <option value="Topwear">Topwear</option>
                      <option value="Bottomwear">Bottomwear</option>
                      <option value="Winterwear">Winterwear</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Sneakers">Sneakers</option>
                      <option value="Espadrilles">Espadrilles</option>
                      <option value="Boots">Boots</option>
                      <option value="Sandals">Sandals</option>
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
                
                {isShoeSizes && (
                  <div className="mb-3">
                    <Button
                      variant={ageGroup === 'enfant' ? 'primary' : 'outline-secondary'}
                      onClick={() => handleAgeGroupChange('enfant')}
                      type="button"
                      className="me-2"
                    >
                      Enfant (19-35)
                    </Button>
                    <Button
                      variant={ageGroup === 'adulte' ? 'primary' : 'outline-secondary'}
                      onClick={() => handleAgeGroupChange('adulte')}
                      type="button"
                    >
                      Adulte (36-45)
                    </Button>
                  </div>
                )}
                
                <div className="d-flex gap-2 flex-wrap">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={sizes.includes(size) ? 'primary' : 'outline-secondary'}
                      onClick={() => toggleSize(size)}
                      type="button"
                      size="sm"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                {sizes.length === 0 && (
                  <Form.Text className="text-danger">
                    Veuillez sélectionner au moins une taille
                  </Form.Text>
                )}
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

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Stock Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter stock quantity"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Discount (%)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter discount percentage (0-100)"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      min="0"
                      max="100"
                    />
                    <Form.Text className="text-muted">
                      Leave 0 for no discount
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {discount > 0 && (
                <Form.Group className="mb-4">
                  <Form.Label>Discount End Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Leave empty for permanent discount
                  </Form.Text>
                </Form.Group>
              )}

              <Button variant="primary" type="submit" size="lg">
                <i className="feather icon-plus me-2" />
                Add Product
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Add;
