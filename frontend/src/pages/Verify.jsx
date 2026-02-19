import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const verifyPayment = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + '/api/order/verifyStripe',
        { success, orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        setCartItems({});
        navigate('/orders');
      } else {
        navigate('/cart');
      }
    } catch (error) {
      console.error('[Verify Error]:', error);
      toast.error(error.message);
      navigate('/cart');
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <div className='inline-flex items-center gap-2'>
        <div className='w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin'></div>
        <p className='text-gray-800'>Verifying your payment...</p>
      </div>
    </div>
  );
};

export default Verify;
