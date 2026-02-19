import express from 'express'
import { loginUser, registerUser, adminLogin, googleLogin, googleRegister, getUserProfile, updateUserProfile, changePassword, requestPasswordReset, resetPassword, uploadProfileImage, verifyEmail } from '../controllers/userController.js'
import authUser from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import { loginLimiter } from '../middleware/rateLimiter.js'
import { verifyRecaptcha } from '../middleware/recaptcha.js'

const userRouter = express.Router();

userRouter.post('/register', loginLimiter, verifyRecaptcha, registerUser)
userRouter.post('/login', loginLimiter, verifyRecaptcha, loginUser)
userRouter.post('/admin', loginLimiter, verifyRecaptcha, adminLogin)
userRouter.post('/google-login', loginLimiter, googleLogin)
userRouter.post('/google-register', loginLimiter, googleRegister)
userRouter.get('/verify-email/:token', verifyEmail)
userRouter.post('/profile', authUser, getUserProfile)
userRouter.post('/update-profile', authUser, updateUserProfile)
userRouter.post('/change-password', authUser, changePassword)
userRouter.post('/request-password-reset', loginLimiter, verifyRecaptcha, requestPasswordReset)
userRouter.post('/reset-password', loginLimiter, verifyRecaptcha, resetPassword)
userRouter.post('/upload-profile-image', authUser, upload.single('image'), uploadProfileImage)

export default userRouter;