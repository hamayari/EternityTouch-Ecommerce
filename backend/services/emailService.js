import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendVerificationEmail = async (email, token, userName) => {
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL] Email service not configured');
        return false;
    }
    const verificationUrl = process.env.FRONTEND_URL + '/verify-email/' + token;
    const mailOptions = {
        from: '"Eternity Touch" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Verify Your Email - Eternity Touch',
        html: '<h2>Hi ' + userName + ',</h2><p>Thank you for signing up! Please verify your email address.</p><p><a href="' + verificationUrl + '">Click here to verify</a></p><p>This link will expire in 24 hours.</p>'
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Verification email sent to ' + email);
        return true;
    } catch (error) {
        console.error('[EMAIL] Error sending verification email:', error.message);
        return false;
    }
};

export const sendWelcomeEmail = async (email, userName) => {
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL] Email service not configured');
        return;
    }
    const mailOptions = {
        from: '"Eternity Touch" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Welcome to Eternity Touch!',
        html: '<h2>Hi ' + userName + ',</h2><p>Your email has been verified successfully! Your account is now active.</p><p><a href="' + process.env.FRONTEND_URL + '">Start Shopping</a></p>'
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Welcome email sent to ' + email);
    } catch (error) {
        console.error('[EMAIL] Error sending welcome email:', error.message);
    }
};

export const sendOrderConfirmation = async (email, orderDetails) => {
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL] Email service not configured');
        return;
    }
    const mailOptions = {
        from: '"Eternity Touch" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Order Confirmation - #' + orderDetails.orderId,
        html: '<h2>Order Confirmed!</h2><p>Order ID: #' + orderDetails.orderId + '</p><p>Total: $' + orderDetails.amount + '</p><p>Status: ' + orderDetails.status + '</p><p>Payment Method: ' + orderDetails.paymentMethod + '</p>'
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Order confirmation sent to ' + email);
    } catch (error) {
        console.error('[EMAIL] Error sending order confirmation:', error.message);
    }
};

export const sendTrackingUpdate = async (email, trackingDetails) => {
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL] Email service not configured');
        return;
    }
    const mailOptions = {
        from: '"Eternity Touch" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Tracking Information - Order #' + trackingDetails.orderId,
        html: '<h2>Your order has been shipped!</h2><p>Order ID: ' + trackingDetails.orderId + '</p><p>Tracking Number: ' + trackingDetails.trackingNumber + '</p><p>Courier: ' + trackingDetails.courier + '</p><p><a href="' + trackingDetails.trackingUrl + '">Track your order</a></p>'
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Tracking info sent to ' + email);
    } catch (error) {
        console.error('[EMAIL] Error sending tracking info:', error.message);
    }
};

export const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER) {
        console.log('[EMAIL] Email service not configured');
        return false;
    }
    const mailOptions = {
        from: '"Eternity Touch" <' + process.env.EMAIL_USER + '>',
        to: to,
        subject: subject,
        html: html
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('[EMAIL] Email sent to ' + to);
        return true;
    } catch (error) {
        console.error('[EMAIL] Error sending email:', error.message);
        return false;
    }
};
