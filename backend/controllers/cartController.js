import userModel from "../models/userModel.js";


// add products to user cart
const addToCart = async (req, res) => {
    try{
        const { userId, itemId, size } = req.body;
        
        // Validation
        if (!userId || !itemId || !size) {
            return res.json({success: false, message: "Missing required fields"});
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }
        
        let cartData = await userData.cartData;
        if(cartData[itemId]){
            if(cartData[itemId][size]){
                // Limite de 99 articles par produit
                if (cartData[itemId][size] >= 99) {
                    return res.json({success: false, message: "Maximum quantity reached (99)"});
                }
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
        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({success: true, message: "Product added to cart successfully"});
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}


// update user cart
const updateCart = async (req, res) => {
    try{
        const { userId, itemId, size, quantity } = req.body;
        
        // Validation
        if (!userId || !itemId || !size || quantity === undefined) {
            return res.status(400).json({success: false, message: "Missing required fields"});
        }
        
        // ✅ Validation stricte de la quantité AVANT toute opération
        const numQuantity = Number(quantity);
        if (!Number.isInteger(numQuantity) || numQuantity < 0 || numQuantity > 99) {
            return res.status(400).json({success: false, message: "Invalid quantity (must be between 0 and 99)"});
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({success: false, message: "User not found"});
        }
        
        let cartData = await userData.cartData;

        cartData[itemId][size] = numQuantity;
        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({success: true, message: "Cart updated successfully"});
    }
    catch(error){
        console.error('Error updating cart:', error);
        res.status(500).json({success: false, message: error.message});
    }
}

// get user cart
const getUserCart = async (req, res) => {
    try{
        const { userId } = req.body;
        
        if (!userId) {
            return res.json({success: false, message: "User ID is required"});
        }
        
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }
        
        let cartData = await userData.cartData;
        res.json({success: true, cartData: cartData});
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export { addToCart, updateCart, getUserCart }