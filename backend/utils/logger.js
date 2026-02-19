/**
 * Professional Logger for Production
 * Replaces console.log with structured logging
 */

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const COLORS = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    DEBUG: '\x1b[90m', // Gray
    RESET: '\x1b[0m'
};

class Logger {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
        this.minLevel = this.isProduction ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    }

    _shouldLog(level) {
        const levels = Object.values(LOG_LEVELS);
        return levels.indexOf(level) <= levels.indexOf(this.minLevel);
    }

    _formatMessage(level, category, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const color = COLORS[level] || '';
        const reset = COLORS.RESET;

        // Production: JSON format for log aggregation
        if (this.isProduction) {
            return JSON.stringify({
                timestamp,
                level,
                category,
                message,
                ...meta,
                pid: process.pid,
                hostname: process.env.HOSTNAME || 'unknown'
            });
        }

        // Development: Human-readable format with colors
        const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
        return `${color}[${timestamp}] [${level}] [${category}]${reset} ${message}${metaStr}`;
    }

    error(category, message, meta = {}) {
        if (!this._shouldLog(LOG_LEVELS.ERROR)) return;
        const formatted = this._formatMessage(LOG_LEVELS.ERROR, category, message, meta);
        console.error(formatted);
    }

    warn(category, message, meta = {}) {
        if (!this._shouldLog(LOG_LEVELS.WARN)) return;
        const formatted = this._formatMessage(LOG_LEVELS.WARN, category, message, meta);
        console.warn(formatted);
    }

    info(category, message, meta = {}) {
        if (!this._shouldLog(LOG_LEVELS.INFO)) return;
        const formatted = this._formatMessage(LOG_LEVELS.INFO, category, message, meta);
        console.log(formatted);
    }

    debug(category, message, meta = {}) {
        if (!this._shouldLog(LOG_LEVELS.DEBUG)) return;
        const formatted = this._formatMessage(LOG_LEVELS.DEBUG, category, message, meta);
        console.log(formatted);
    }

    // Convenience methods for common categories
    order(message, meta = {}) {
        this.info('ORDER', message, meta);
    }

    email(message, meta = {}) {
        this.info('EMAIL', message, meta);
    }

    payment(message, meta = {}) {
        this.info('PAYMENT', message, meta);
    }

    auth(message, meta = {}) {
        this.info('AUTH', message, meta);
    }

    api(message, meta = {}) {
        this.debug('API', message, meta);
    }
}

// Singleton instance
const logger = new Logger();

export default logger;
