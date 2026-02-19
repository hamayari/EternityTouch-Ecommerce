import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';

const Breadcrumb = () => {
  const location = useLocation();
  
  const pageTitles = {
    '/': 'Dashboard',
    '/add': 'Add Product',
    '/list': 'Product List',
    '/order': 'Order Management',
    '/edit': 'Edit Product'
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/edit/')) return 'Edit Product';
    return pageTitles[path] || 'Dashboard';
  };

  const title = getPageTitle();
  document.title = `${title} | Eternity Touch Admin`;

  return (
    <div className="page-header">
      <div className="page-block">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="page-header-title">
              <h5 className="m-b-10">{title}</h5>
            </div>
            <ListGroup as="ul" bsPrefix=" " className="breadcrumb">
              <ListGroup.Item as="li" bsPrefix=" " className="breadcrumb-item">
                <Link to="/">
                  <i className="feather icon-home" />
                </Link>
              </ListGroup.Item>
              <ListGroup.Item as="li" bsPrefix=" " className="breadcrumb-item">
                <Link to="#">{title}</Link>
              </ListGroup.Item>
            </ListGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
