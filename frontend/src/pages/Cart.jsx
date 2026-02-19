import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import CouponInput from '../components/CouponInput';
import ProductRecommendations from '../components/ProductRecommendations';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, backendUrl} = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, itemId: null, size: null }); // ✅ FIX: Confirmation dialog
  
  useEffect(()=>{
    if(products.length > 0){
      const tempData = [];
    for(const items in cartItems){
      for(const item in cartItems[items]){
        if(cartItems[items][item] > 0){
          tempData.push({
            _id: items,
            size : item,
            quantity: cartItems[items][item]
          })
        }
      }
    }
    setCartData(tempData);
    }
    
  }, [cartItems, products])

  // ✅ FIX: Handle delete with confirmation
  const handleDeleteClick = (itemId, size) => {
    setDeleteDialog({ open: true, itemId, size });
  };

  const handleDeleteConfirm = () => {
    updateQuantity(deleteDialog.itemId, deleteDialog.size, 0);
    setDeleteDialog({ open: false, itemId: null, size: null });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, itemId: null, size: null });
  };
  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2 = {'CART'}/>
      </div>
      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product)=> product._id === item._id);
          
          // ✅ FIX: Vérifier si le produit existe toujours
          if (!productData) {
            // Produit supprimé - le retirer automatiquement du panier
            updateQuantity(item._id, item.size, 0);
            return null;
          }
          
          // Check stock status
          const isOutOfStock = productData.stock !== undefined && productData.stock === 0;
          const isLowStock = productData.stock !== undefined && productData.stock < item.quantity;
          
          return (
            <div key={index} className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
              <div className='flex items-start gap-6'>
                <div className="relative">
                  <img src={productData.images[0]} className='w-16 sm:w-20' alt="" />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">OUT</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency}{productData.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                  </div>
                  {isOutOfStock && (
                    <p className="text-red-600 text-xs mt-2 font-semibold">⚠️ Out of stock - Please remove</p>
                  )}
                  {!isOutOfStock && isLowStock && (
                    <p className="text-orange-600 text-xs mt-2 font-semibold">⚡ Only {productData.stock} available</p>
                  )}
                </div>
              </div>
              <input 
                onChange={(e)=> e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' 
                type="number" 
                min='1' 
                max={productData.stock || 999}
                defaultValue={item.quantity}
                disabled={isOutOfStock}
              />
              <img onClick={()=> handleDeleteClick(item._id, item.size)} src={assets.bin_icon} className='w-4 mr-4 sm:w-5 cursor-pointer' alt="" />
            </div>
          )
        })}
      </div>
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CouponInput onCouponApplied={setAppliedCoupon} appliedCoupon={appliedCoupon} />
          <div className='mt-6'>
            <CartTotal coupon={appliedCoupon} />
          </div>
          <div className='w-full text-end'>
            <button onClick={()=> navigate('/place-order')} className='bg-black text-white text-sm my-8 px-8 py-3'>PROCEED TO CHECKOUT</button>
          </div>
        </div>
      </div>

      {/* Complete Your Look Recommendations */}
      {cartData.length > 0 && (
        <ProductRecommendations
          title="👔 Complete Your Look"
          type="complete-look"
          cartItems={cartData}
          limit={4}
          backendUrl={backendUrl}
          currency={currency}
        />
      )}

      {/* ✅ FIX: Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Remove Item from Cart?</DialogTitle>
        <DialogContent>
          Are you sure you want to remove this item from your cart?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Cart;
