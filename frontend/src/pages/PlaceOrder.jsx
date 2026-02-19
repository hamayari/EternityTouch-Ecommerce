import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const [errors, setErrors] = useState({}); // ✅ FIX: Validation errors

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
    
    // ✅ FIX: Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ FIX: Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Phone validation (10-15 digits)
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10-15 digits';
    }
    
    // Zipcode validation (5-10 digits)
    if (formData.zipcode && !/^\d{5,10}$/.test(formData.zipcode)) {
      newErrors.zipcode = 'Invalid zipcode format';
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (token) {
      fetchSavedAddresses();
    }
  }, [token]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/address/get`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setSavedAddresses(response.data.addresses);
        // Auto-select default address
        const defaultAddr = response.data.addresses.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (response.data.addresses.length > 0) {
          setSelectedAddressId(response.data.addresses[0]._id);
        } else {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // ✅ FIX: Validate form before submission
    if (useNewAddress && !validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      let orderItems = [];
      let hasOutOfStock = false;

      Object.keys(cartItems).forEach((itemId) => {
        Object.keys(cartItems[itemId]).forEach((size) => {
          if (cartItems[itemId][size] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === itemId));
            if (itemInfo) {
              // Check stock availability
              if (itemInfo.stock !== undefined && itemInfo.stock === 0) {
                hasOutOfStock = true;
                toast.error(`${itemInfo.name} is out of stock. Please remove it from cart.`);
              } else if (itemInfo.stock !== undefined && itemInfo.stock < cartItems[itemId][size]) {
                hasOutOfStock = true;
                toast.error(`Only ${itemInfo.stock} units of ${itemInfo.name} available. Please update quantity.`);
              }
              
              itemInfo.size = size;
              itemInfo.quantity = cartItems[itemId][size];
              orderItems.push(itemInfo);
            }
          }
        });
      });
      
      // Stop if any item is out of stock
      if (hasOutOfStock) {
        return;
      }

      // Determine which address to use
      let addressData;
      if (useNewAddress) {
        addressData = formData;
      } else {
        const selectedAddr = savedAddresses.find(addr => addr._id === selectedAddressId);
        if (selectedAddr) {
          addressData = {
            firstName: selectedAddr.firstName,
            lastName: selectedAddr.lastName,
            email: formData.email || '', // Email from form
            street: selectedAddr.street,
            city: selectedAddr.city,
            state: selectedAddr.state,
            zipcode: selectedAddr.zipCode,
            country: selectedAddr.country,
            phone: selectedAddr.phone
          };
        } else {
          toast.error('Please select an address');
          return;
        }
      }
      
      let orderData = {
        address: addressData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      switch (method) {
        case 'cod':
          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;
        
        case 'stripe':
          const responseStripe = await axios.post(`${backendUrl}/api/order/stripe`, orderData, { headers: { token } });
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div className='mb-4'>
            <p className='text-sm font-medium mb-3'>Select a saved address:</p>
            <div className='flex flex-col gap-2'>
              {savedAddresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => handleAddressSelect(address._id)}
                  className={`border rounded p-3 cursor-pointer transition-all ${
                    selectedAddressId === address._id && !useNewAddress
                      ? 'border-black bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='font-medium text-sm'>{address.label}</p>
                        {address.isDefault && (
                          <span className='text-xs bg-black text-white px-2 py-0.5 rounded'>Default</span>
                        )}
                      </div>
                      <p className='text-sm text-gray-600'>
                        {address.firstName} {address.lastName}
                      </p>
                      <p className='text-sm text-gray-600'>{address.phone}</p>
                      <p className='text-sm text-gray-600'>
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedAddressId === address._id && !useNewAddress
                        ? 'border-black'
                        : 'border-gray-300'
                    }`}>
                      {selectedAddressId === address._id && !useNewAddress && (
                        <div className='w-2 h-2 rounded-full bg-black'></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              type='button'
              onClick={() => setUseNewAddress(!useNewAddress)}
              className='mt-3 text-sm text-gray-600 hover:text-black underline'
            >
              {useNewAddress ? 'Use saved address' : '+ Use a new address'}
            </button>
          </div>
        )}

        {/* New Address Form */}
        {(useNewAddress || savedAddresses.length === 0) && (
          <>
            <div className='flex gap-3'>
              <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
              <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
            </div>
            <div className='w-full'>
              <input required onChange={onChangeHandler} name='email' value={formData.email} className={`border rounded py-1.5 px-3.5 w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`} type="email" placeholder='Email address' />
              {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
            </div>
            <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
            <div className='flex gap-3'>
              <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
              <input required onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
            </div>
            <div className='flex gap-3'>
              <div className='w-full'>
                <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className={`border rounded py-1.5 px-3.5 w-full ${errors.zipcode ? 'border-red-500' : 'border-gray-300'}`} type="text" placeholder='Zipcode' />
                {errors.zipcode && <p className='text-red-500 text-xs mt-1'>{errors.zipcode}</p>}
              </div>
              <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
            </div>
            <div className='w-full'>
              <input required onChange={onChangeHandler} name='phone' value={formData.phone} className={`border rounded py-1.5 px-3.5 w-full ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} type="tel" placeholder='Phone (10-15 digits)' />
              {errors.phone && <p className='text-red-500 text-xs mt-1'>{errors.phone}</p>}
            </div>
          </>
        )}

        {/* Email field when using saved address */}
        {!useNewAddress && savedAddresses.length > 0 && (
          <div className='w-full'>
            <input required onChange={onChangeHandler} name='email' value={formData.email} className={`border rounded py-1.5 px-3.5 w-full ${errors.email ? 'border-red-500' : 'border-gray-300'}`} type="email" placeholder='Email address for order confirmation' />
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
          </div>
        )}
      </div>
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className={`h-5 mx-4`} src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`} ></p>
              <img className={`h-5 mx-4`} src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
