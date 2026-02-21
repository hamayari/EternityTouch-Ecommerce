import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext); // Only accessing the necessary value
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]); // Ensure that you re-fetch products if they change

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
        <Title text1={'DERNIÈRES'} text2={'COLLECTIONS'} />
        {products.length === 0 && (
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Découvrez nos nouveautés mode et beauté
          </p>
        )}
      </div>
      {/* Rendering products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {latestProducts.map((item, index) => (
          <ProductItem 
            key={index} 
            id={item._id} 
            image={item.images} 
            name={item.name} 
            price={item.price}
            stock={item.stock}
            averageRating={item.averageRating}
            totalReviews={item.totalReviews}
            discount={item.discount}
            discountEndDate={item.discountEndDate}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
