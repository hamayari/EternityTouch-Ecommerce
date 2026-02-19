// Password strength validator
export const validatePasswordStrength = (password) => {
    // ✅ Minimum 12 caractères en production, 8 en dev
    const minLength = process.env.NODE_ENV === 'production' ? 12 : 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters`);
    }

    // ✅ Toujours exiger la complexité (même en dev pour habituer les utilisateurs)
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter (A-Z)');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter (a-z)');
    if (!hasNumbers) errors.push('Password must contain at least one number (0-9)');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*...)');

    // ✅ Check for common passwords
    if (isCommonPassword(password)) {
        errors.push('This password is too common. Please choose a more unique password.');
    }

    // ✅ Check for sequential characters
    if (hasSequentialChars(password)) {
        errors.push('Password should not contain sequential characters (e.g., 123, abc)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength: calculateStrength(password),
        message: errors.length > 0 ? errors.join('. ') : 'Password is strong'
    };
};

const calculateStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(password)) strength++;
    
    // Bonus for variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 10) strength++;

    if (strength <= 3) return 'weak';
    if (strength <= 5) return 'medium';
    if (strength <= 7) return 'strong';
    return 'very strong';
};

// Check for common passwords
const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
    'bailey', 'passw0rd', 'shadow', '123123', '654321',
    'password123', 'admin', 'admin123', 'root', 'user',
    'welcome', 'welcome123', 'test', 'test123', 'demo'
];

export const isCommonPassword = (password) => {
    return commonPasswords.includes(password.toLowerCase());
};

// ✅ Check for sequential characters
const hasSequentialChars = (password) => {
    const sequences = [
        '0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
    ];
    
    const lowerPassword = password.toLowerCase();
    
    for (const seq of sequences) {
        for (let i = 0; i < seq.length - 2; i++) {
            const substring = seq.substring(i, i + 3);
            if (lowerPassword.includes(substring)) {
                return true;
            }
        }
    }
    
    return false;
};
