import React, {useContext, useEffect, useState} from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';

const BestSeller = () => {
    const {backendUrl} = useContext(ShopContext); 
    const [bestSeller, setBestSeller] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                setLoading(true);
                // Récupérer les produits les plus vendus depuis le backend
                const response = await axios.get(`${backendUrl}/api/product/bestsellers`);
                if (response.data.success) {
                    setBestSeller(response.data.products.slice(0, 5));
                }
            } catch (error) {
                console.error('Error fetching best sellers:', error);
                // En cas d'erreur, on peut garder un fallback vide
                setBestSeller([]);
            } finally {
                setLoading(false);
            }
        };

        if (backendUrl) {
            fetchBestSellers();
        }
    }, [backendUrl]);

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'MEILLEURES'} text2={'VENTES'}/>
      </div>
      
      {loading ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>Chargement des meilleures ventes...</p>
        </div>
      ) : bestSeller.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-500'>Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {bestSeller.map((item, index) => (
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
      )}
    </div>
  );
}

export default BestSeller
