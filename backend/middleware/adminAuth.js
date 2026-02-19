import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token){
            return res.status(401).json({success : false, message: "Not Authorized Login Again"})
        }
        
        // Verify JWT token
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (token_decode.exp && token_decode.exp < now) {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again' });
        }
        
        // Get user from database
        const user = await userModel.findById(token_decode.id).select('email');
        
        if (!user) {
            return res.status(401).json({success : false, message: "User not found"})
        }
        
        // Check if user is admin
        if(user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({success : false, message: "Access denied. Admin only."})
        }
        
        // Add userId to request for use in controllers
        req.body.userId = token_decode.id;
        
        next()
    }
    catch (error){
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again' });
        }
        res.status(401).json({ success: false, message: 'Authentication failed' })
    }
}

export default adminAuth