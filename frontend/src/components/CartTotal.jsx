import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ coupon }) => {
    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext);
    const subtotal = getCartAmount();
    const discount = coupon ? parseFloat(coupon.discount) : 0;
    const total = subtotal === 0 ? 0 : subtotal - discount + delivery_fee;
    
  return (
    <div className='w-full'>
        <div className='text-2xl'>
            <Title text1={'CART'} text2={'TOTALS'}/>
        </div>
        <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency} {subtotal}.00</p>
            </div>
            <hr />
            {coupon && (
                <>
                    <div className='flex justify-between text-green-600'>
                        <p>Discount ({coupon.code})</p>
                        <p>-{currency} {discount}</p>
                    </div>
                    <hr />
                </>
            )}
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p>{currency} {delivery_fee}</p>
            </div>
            <hr />
            <div className='flex justify-between font-bold'>
                <p>Total</p>
                <p>{currency} {total.toFixed(2)}</p>
            </div>
        </div>
    </div>
  )
}

export default CartTotal
