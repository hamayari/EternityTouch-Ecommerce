import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 Génération des secrets pour PRODUCTION\n');
console.log('⚠️  NE JAMAIS utiliser ces secrets en développement!\n');

// Generate secrets
const secrets = {
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    ADMIN_PASSWORD: crypto.randomBytes(16).toString('base64'),
    SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
};

console.log('✅ Secrets générés:\n');
console.log('JWT_SECRET (128 caractères):');
console.log(secrets.JWT_SECRET);
console.log('\nADMIN_PASSWORD:');
console.log(secrets.ADMIN_PASSWORD);
console.log('\nSESSION_SECRET (64 caractères):');
console.log(secrets.SESSION_SECRET);

// Create .env.production template
const envTemplate = `# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ========================================
# ⚠️  NE JAMAIS commit ce fichier sur Git!
# ⚠️  Copier ces valeurs dans votre plateforme de déploiement

# Environment
NODE_ENV=production
PORT=4000

# ========================================
# DATABASE
# ========================================
# MongoDB Atlas connection string
# Format: mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# ========================================
# SECURITY
# ========================================
# JWT Secret (GÉNÉRÉ - Ne pas modifier)
JWT_SECRET=${secrets.JWT_SECRET}

# Admin Credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=${secrets.ADMIN_PASSWORD}

# Session Secret (GÉNÉRÉ - Ne pas modifier)
SESSION_SECRET=${secrets.SESSION_SECRET}

# ========================================
# CLOUDINARY (Image Storage)
# ========================================
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# ========================================
# STRIPE PAYMENT
# ========================================
# ⚠️  Commencer en mode TEST, puis passer en LIVE
# Test: sk_test_...
# Live: sk_live_...
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ========================================
# EMAIL
# ========================================
# Option 1: Gmail (Gratuit)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_business_email@gmail.com
EMAIL_PASS=your_app_password_16_chars

# Option 2: SendGrid (Recommandé)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your_sendgrid_api_key

# Option 3: Brevo (Recommandé)
# EMAIL_HOST=smtp-relay.brevo.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@domain.com
# EMAIL_PASS=your_brevo_smtp_key

# ========================================
# FRONTEND URL
# ========================================
# Mettre à jour après déploiement frontend
FRONTEND_URL=https://your-frontend.vercel.app

# ========================================
# PAYMENT & DELIVERY
# ========================================
CURRENCY=usd
DELIVERY_FEE=10

# ========================================
# OPTIONAL SERVICES
# ========================================
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id

# Google reCAPTCHA v3 (Optional)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Google Gemini AI (Optional - for Q&A)
GEMINI_API_KEY=your_gemini_api_key

# AfterShip Tracking (Optional)
AFTERSHIP_API_KEY=your_aftership_key

# Sentry Error Monitoring (Recommandé)
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# ========================================
# NOTES
# ========================================
# 1. Remplacer TOUTES les valeurs "your_..." par vos vraies clés
# 2. MongoDB Atlas: Créer cluster sur https://cloud.mongodb.com
# 3. Cloudinary: Obtenir clés sur https://cloudinary.com/console
# 4. Stripe: Obtenir clés sur https://dashboard.stripe.com/apikeys
# 5. Sentry: Créer projet sur https://sentry.io
# 6. Email: Configurer selon votre choix (Gmail/SendGrid/Brevo)
`;

// Save to file
const envPath = path.join(process.cwd(), '.env.production');
fs.writeFileSync(envPath, envTemplate);

console.log('\n✅ Fichier .env.production créé!');
console.log(`📁 Emplacement: ${envPath}`);
console.log('\n📋 Prochaines étapes:');
console.log('1. Ouvrir .env.production');
console.log('2. Remplacer toutes les valeurs "your_..." par vos vraies clés');
console.log('3. Copier ces variables dans votre plateforme de déploiement (Render/Vercel)');
console.log('4. NE JAMAIS commit .env.production sur Git!');
console.log('\n⚠️  IMPORTANT:');
console.log('- JWT_SECRET et ADMIN_PASSWORD sont déjà générés');
console.log('- Garder Stripe en mode TEST au début');
console.log('- Configurer MongoDB Atlas avant de déployer');
console.log('\n🔒 Sécurité:');
console.log('- Ces secrets sont uniques et sécurisés');
console.log('- Ne les partagez JAMAIS');
console.log('- Ne les utilisez QUE en production');
