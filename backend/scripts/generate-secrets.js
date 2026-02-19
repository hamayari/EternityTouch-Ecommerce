import crypto from 'crypto';

console.log('\n🔐 GÉNÉRATION DE CLÉS SÉCURISÉES POUR PRODUCTION\n');
console.log('='.repeat(60));

// JWT Secret (64 bytes = 128 caractères hex)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n1. JWT_SECRET (copier dans .env.production):');
console.log(jwtSecret);

// Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n2. SESSION_SECRET (si nécessaire):');
console.log(sessionSecret);

// API Key
const apiKey = crypto.randomBytes(32).toString('base64');
console.log('\n3. API_KEY (si nécessaire):');
console.log(apiKey);

// Encryption Key
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n4. ENCRYPTION_KEY (si nécessaire):');
console.log(encryptionKey);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT:');
console.log('- Copier ces clés dans votre .env.production');
console.log('- NE JAMAIS commit ces clés sur Git');
console.log('- Garder ces clés en lieu sûr (gestionnaire de mots de passe)');
console.log('- Régénérer si compromises');
console.log('\n');
