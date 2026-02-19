import jwt from 'jsonwebtoken'

const authUser = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not Authorized Login Again'})
    }
    try{
        const token_decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier l'expiration du token
        const now = Math.floor(Date.now() / 1000);
        if (token_decoded.exp && token_decoded.exp < now) {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again' });
        }
        
        req.body.userId = token_decoded.id
        next()
    }
    catch(error){
        console.log(error)
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token. Please login again' });
        }
        res.status(401).json({ success: false, message: 'Authentication failed' })
    }
}

export default authUser;