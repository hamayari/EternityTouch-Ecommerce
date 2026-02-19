import { createContext, useEffect, useState, useCallback } from "react"; 
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';



export const ShopContext = createContext(); 

const ShopContextProvider = (props) => { 
    const currency = '$'; 
    const delivery_fee = 10; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([])
    const [token, setToken] = useState('')
    const [wishlist, setWishlist] = useState([])
    const navigate = useNavigate();

    // ✅ FIX: Race condition - use ref to track pending requests
    const [isUpdatingCart, setIsUpdatingCart] = useState(false);
    
    const addToCart = async (itemId, size) => {
        if(!size){
            toast.error('Select Product Size');
            return;
        }
        
        // ✅ FIX: Prevent race condition on rapid clicks
        if (isUpdatingCart) {
            return;
        }
        
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }
            else{
                cartData[itemId][size] = 1;
            }
        }
        else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        
        if(token){
            setIsUpdatingCart(true); // ✅ FIX: Lock updates
            try{
                await axios.post(backendUrl + '/api/cart/add', {itemId, size}, {headers:{token}})
            }
            catch(error){
                toast.error(error.message)
            }
            finally {
                setIsUpdatingCart(false); // ✅ FIX: Unlock updates
            }
        }
        
    }
       
    const getCartCount = () => {
        let totalCount = 0;
        for(const items in cartItems){
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item] > 0){
                        totalCount += cartItems[items][item]
                    }
                }
                catch(error){
                
                }
            }   
        }
        return totalCount;
    }
    const updateQuantity = useCallback(async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);
        if(token){
            try{
                await axios.post(backendUrl + '/api/cart/update', {itemId, size, quantity}, {headers: {token}})
            }
            catch(error){
                console.error('[Cart Update Error]:', error);
                toast.error(error.message)
            }
        }
    }, [cartItems, token, backendUrl]);
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            for(const item in cartItems[items]){
                try{
                    if(cartItems[items][item] > 0){
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                }
                catch (error){

                }
            }
        }
        return totalAmount;
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if(response.data.success){
                setProducts(response.data.products);
            }
            else{
                toast.error(response.data.message)
            }
        }
        catch (error){
            console.error('[Products Fetch Error]:', error);
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try{
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers: {token}})
            if(response.data.success){
                setCartItems(response.data.cartData);
            }
        }
        catch (error){
            console.error('[Cart Fetch Error]:', error);
            toast.error(error.message)
        }
    }

    const getWishlist = async (token) => {
        try{
            const response = await axios.post(backendUrl + '/api/wishlist/get', {}, {headers: {token}})
            if(response.data.success){
                setWishlist(response.data.wishlist);
            }
        }
        catch (error){
            console.error('[Wishlist Fetch Error]:', error);
        }
    }

    const addToWishlist = async (productId) => {
        if(!token){
            toast.error('Please login to add to wishlist');
            return;
        }
        try{
            const response = await axios.post(backendUrl + '/api/wishlist/add', {productId}, {headers: {token}})
            if(response.data.success){
                setWishlist(response.data.wishlist);
                toast.success('Added to wishlist');
            }
        }
        catch (error){
            console.error('[Wishlist Add Error]:', error);
            toast.error(error.message)
        }
    }

    const removeFromWishlist = async (productId) => {
        if(!token){
            return;
        }
        try{
            const response = await axios.post(backendUrl + '/api/wishlist/remove', {productId}, {headers: {token}})
            if(response.data.success){
                setWishlist(response.data.wishlist);
                toast.success('Removed from wishlist');
            }
        }
        catch (error){
            console.error('[Wishlist Remove Error]:', error);
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getProductsData()
    }, [token])

    useEffect(()=>{
        if(!token && localStorage.getItem('token')){
            setToken(localStorage.getItem('token'))
            getUserCart(localStorage.getItem('token'))
            getWishlist(localStorage.getItem('token'))
        }
        if(token){
            getWishlist(token)
        }
    }, [token])

    const value = { 
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, 
        getCartCount, updateQuantity, getCartAmount,
        navigate, backendUrl, token, setToken,
        setProducts,
        wishlist, addToWishlist, removeFromWishlist
    } 
    return ( 
        <ShopContext.Provider value={value}> 
            {props.children}
        </ShopContext.Provider> 
    ) 
} 
export default ShopContextProvider;