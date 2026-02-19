// Middleware pour logger les actions sensibles
import fs from 'fs';
import path from 'path';

const logDir = './logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

export const auditLog = (action) => {
    return (req, res, next) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            userId: req.body.userId || 'anonymous',
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            body: { ...req.body, password: undefined } // Ne pas logger les mots de passe
        };

        const logFile = path.join(logDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

        next();
    };
};
