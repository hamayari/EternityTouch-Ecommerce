import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {v2 as cloudinary} from 'cloudinary';
import { generateTwoFactorCode, sendTwoFactorCode, verifyTwoFactorCode } from '../services/twoFactorService.js';
import { OAuth2Client } from 'google-auth-library';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';
import { validatePasswordStrength } from '../utils/passwordValidator.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}
// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation des champs requis
        if (!email || !password) {
            return res.json({ success:false, message: "Email and password are required" });
        }
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success:false, message: "User doesn't exist"})
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.json({ success:false, message: "Please verify your email before logging in. Check your inbox for the verification link." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success:false, message: "Invalid password" });
        }
        else{
            const token = createToken(user._id);
            res.json({ success: true, token: token });
        }
        
    }
    catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validation des champs requis
        if (!name || !email || !password) {
            return res.json({ success:false, message: "All fields are required" });
        }
        
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({ success:false, message: "User already exists" });
        }
        if(!validator.isEmail(email)){
            return res.json({ success:false, message: "Please enter a valid email" });
        }
        
        // ✅ Validation stricte du mot de passe
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: passwordValidation.message,
                errors: passwordValidation.errors
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            emailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });
        const user = await newUser.save();

        // Send verification email
        const emailSent = await sendVerificationEmail(email, verificationToken, name);

        if (emailSent) {
            res.json({ 
                success: true, 
                message: "Registration successful! Please check your email to verify your account.",
                requiresVerification: true
            });
        } else {
            // If email service is not configured, auto-verify the account
            user.emailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationExpires = undefined;
            await user.save();
            
            const token = createToken(user._id);
            res.json({ 
                success: true, 
                token,
                message: "Registration successful! (Email verification skipped - service not configured)"
            });
        }

    }
    catch (error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// Route for admin login (Step 1: Send 2FA code)
const adminLogin = async (req, res) => {
    try {
        const { email, password, twoFactorCode } = req.body;
        
        // Validation des champs requis
        if (!email || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }
        
        // Chercher l'admin dans la base de données
        const adminUser = await userModel.findOne({ email, isAdmin: true });
        
        if (!adminUser) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, adminUser.password);
        
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // Si un code 2FA est fourni, le vérifier
        if (twoFactorCode) {
            // Vérifier le code
            if (verifyTwoFactorCode(adminUser.twoFactorCode, adminUser.twoFactorExpires, twoFactorCode)) {
                // Code valide → Générer le token SÉCURISÉ
                const token = createToken(adminUser._id);
                
                // Nettoyer le code 2FA
                adminUser.twoFactorCode = undefined;
                adminUser.twoFactorExpires = undefined;
                await adminUser.save();
                
                return res.json({ success: true, token });
            } else {
                return res.json({ success: false, message: "Invalid or expired 2FA code" });
            }
        }

        // Pas de code 2FA fourni → Envoyer le code par email (si 2FA activé)
        if (adminUser.twoFactorEnabled) {
            const code = generateTwoFactorCode();
            const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            adminUser.twoFactorCode = code;
            adminUser.twoFactorExpires = expires;
            await adminUser.save();

            // Envoyer le code par email
            const sent = await sendTwoFactorCode(email, code);

            if (sent) {
                return res.json({ 
                    success: true, 
                    requiresTwoFactor: true,
                    message: "2FA code sent to your email" 
                });
            } else {
                // Si l'email ne peut pas être envoyé, permettre la connexion sans 2FA
                console.warn('[2FA] Email not configured, allowing login without 2FA');
                const token = createToken(adminUser._id);
                return res.json({ success: true, token });
            }
        }

        // Pas de 2FA → Connexion directe
        const token = createToken(adminUser._id);
        res.json({ success: true, token });
            console.warn('[2FA] Email not configured, allowing login without 2FA');
            const token = createToken(adminUser._id);
            res.json({ success: true, token });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, email } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        const updateData = {};
        if (name) updateData.name = name;
        if (email) {
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: "Please enter a valid email" });
            }
            // Check if email already exists
            const existingUser = await userModel.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.json({ success: false, message: "Email already in use" });
            }
            updateData.email = email;
        }
        
        const user = await userModel.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Change password
const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        
        // ✅ Validation stricte du nouveau mot de passe
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: passwordValidation.message,
                errors: passwordValidation.errors
            });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        await user.save();
        
        res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: true, message: "If the email exists, a reset link will be sent" });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log('Password Reset URL:', resetUrl);
        
        res.json({ 
            success: true, 
            message: "Password reset link sent to email",
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }
        
        // ✅ Validation stricte du nouveau mot de passe
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: passwordValidation.message,
                errors: passwordValidation.errors
            });
        }
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        const { userId } = req.body;
        const imageFile = req.file;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }
        
        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image file is required" });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Delete old image from cloudinary if exists
        if (user.profileImage) {
            const publicId = user.profileImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
        
        // Upload new image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: 'image',
            folder: 'profile_images'
        });
        
        user.profileImage = imageUpload.secure_url;
        await user.save();
        
        res.json({ 
            success: true, 
            message: "Profile image uploaded successfully",
            profileImage: imageUpload.secure_url
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Verify email with token
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ success: false, message: "Verification token is required" });
        }
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await userModel.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
        }
        
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(user.email, user.name);
        
        res.json({ success: true, message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// Google Login
const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.json({ success: false, message: "Google credential is required" });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        let user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Account not found. Please sign up first." });
        }

        // Generate token
        const token = createToken(user._id);
        res.json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Google authentication failed" });
    }
}

// Google Register
const googleRegister = async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!credential) {
            return res.json({ success: false, message: "Google credential is required" });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Check if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists. Please login." });
        }

        // Create new user with Google data (auto-verified)
        const newUser = new userModel({
            name,
            email,
            password: await bcrypt.hash(googleId, 10), // Use Google ID as password (user won't use it)
            profileImage: picture,
            googleId,
            emailVerified: true // Google accounts are pre-verified
        });

        const user = await newUser.save();

        // Send welcome email
        await sendWelcomeEmail(email, name);

        const token = createToken(user._id);
        
        res.json({ success: true, token });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Google registration failed" });
    }
}

export { 
    loginUser, 
    registerUser, 
    adminLogin, 
    googleLogin,
    googleRegister,
    getUserProfile, 
    updateUserProfile, 
    changePassword,
    requestPasswordReset,
    resetPassword,
    uploadProfileImage,
    verifyEmail
};