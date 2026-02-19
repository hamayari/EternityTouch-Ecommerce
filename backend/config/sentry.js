import * as Sentry from "@sentry/node";

export const initSentry = (app) => {
    // Ne pas initialiser Sentry en développement
    if (process.env.NODE_ENV !== 'production') {
        // Pas de log en développement
        return;
    }

    // Vérifier si la clé Sentry est configurée
    if (!process.env.SENTRY_DSN || process.env.SENTRY_DSN === 'your_sentry_dsn_here') {
        console.log('⚠️  Sentry not configured (SENTRY_DSN missing)');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'production',
        tracesSampleRate: 1.0,
        
        // Filtrer les informations sensibles
        beforeSend(event) {
            if (event.request && event.request.data) {
                if (event.request.data.password) {
                    event.request.data.password = '[FILTERED]';
                }
                if (event.request.data.token) {
                    event.request.data.token = '[FILTERED]';
                }
            }
            return event;
        },
    });

    console.log('✅ Sentry monitoring initialized');
};

// Middleware simplifiés pour éviter les erreurs
export const sentryRequestHandler = () => {
    return (req, res, next) => next();
};

export const sentryTracingHandler = () => {
    return (req, res, next) => next();
};

export const sentryErrorHandler = () => {
    return (err, req, res, next) => {
        if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
            Sentry.captureException(err);
        }
        next(err);
    };
};
