import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Générer un code à 6 chiffres
export const generateTwoFactorCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Envoyer le code 2FA par email
export const sendTwoFactorCode = async (email, code) => {
    if (!process.env.EMAIL_USER) {
        console.log('[2FA] Email service not configured');
        return false;
    }

    const mailOptions = {
        from: `"Forever Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your 2FA Code - Forever Admin',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Two-Factor Authentication</h2>
                <p>Your verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${code}
                </div>
                <p style="color: #666;">This code will expire in 10 minutes.</p>
                <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Forever Store - Admin Security</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[2FA] Code sent to ${email}`);
        return true;
    } catch (error) {
        console.error('[2FA] Error sending code:', error.message);
        return false;
    }
};

// Vérifier si le code est valide
export const verifyTwoFactorCode = (storedCode, storedExpires, providedCode) => {
    if (!storedCode || !storedExpires) {
        return false;
    }

    // Vérifier l'expiration
    if (new Date() > new Date(storedExpires)) {
        return false;
    }

    // Vérifier le code
    return storedCode === providedCode;
};
