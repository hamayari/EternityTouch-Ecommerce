import axios from 'axios';
import logger from '../utils/logger.js';

// Middleware pour vérifier le token reCAPTCHA
export const verifyRecaptcha = async (req, res, next) => {
    // Skip en développement si pas configuré
    if (!process.env.RECAPTCHA_SECRET_KEY) {
        logger.warn('RECAPTCHA', 'Not configured, skipping verification');
        return next();
    }

    const token = req.body.recaptchaToken;

    if (!token) {
        return res.json({ 
            success: false, 
            message: 'reCAPTCHA token missing' 
        });
    }

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );

        const { success, score } = response.data;

        // reCAPTCHA v3 retourne un score de 0.0 à 1.0
        // 1.0 = très probablement humain
        // 0.0 = très probablement bot
        if (!success || score < 0.5) {
            logger.warn('RECAPTCHA', 'Verification failed', { score });
            return res.json({ 
                success: false, 
                message: 'reCAPTCHA verification failed. Please try again.' 
            });
        }

        logger.debug('RECAPTCHA', 'Verified successfully', { score });
        next();
    } catch (error) {
        logger.error('RECAPTCHA', 'Error during verification', { error: error.message });
        // En cas d'erreur, on laisse passer (fail-open) pour ne pas bloquer les vrais utilisateurs
        next();
    }
};
