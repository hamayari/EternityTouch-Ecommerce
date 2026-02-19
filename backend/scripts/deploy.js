// Script de déploiement - Vérifie que tout est prêt pour la production
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement de production
dotenv.config({ path: '.env.production' });

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

console.log('🚀 VÉRIFICATION PRÉ-DÉPLOIEMENT\n');
console.log('═'.repeat(60));

// 1. Vérifier MongoDB
console.log('\n📊 1. Base de données...');
if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
    checks.passed.push('✅ MongoDB Atlas configuré');
} else if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost')) {
    checks.failed.push('❌ MongoDB utilise localhost (pas production)');
} else {
    checks.failed.push('❌ MONGODB_URI non configuré');
}

// 2. Vérifier JWT Secret
console.log('\n🔐 2. Sécurité...');
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 64) {
    checks.passed.push('✅ JWT_SECRET suffisamment long');
} else {
    checks.failed.push('❌ JWT_SECRET trop court (minimum 64 caractères)');
}

// 3. Vérifier mot de passe admin
if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12) {
    checks.passed.push('✅ Mot de passe admin fort');
} else {
    checks.failed.push('❌ Mot de passe admin trop faible');
}

// 4. Vérifier Stripe
console.log('\n💳 3. Paiements...');
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    checks.passed.push('✅ Stripe en mode LIVE');
} else if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    checks.warnings.push('⚠️  Stripe en mode TEST (changez pour production)');
} else {
    checks.failed.push('❌ Stripe non configuré');
}

// 5. Vérifier AfterShip
console.log('\n📦 4. Tracking...');
if (process.env.AFTERSHIP_API_KEY && process.env.AFTERSHIP_API_KEY.startsWith('asat_')) {
    checks.passed.push('✅ AfterShip configuré');
} else {
    checks.warnings.push('⚠️  AfterShip non configuré (tracking limité)');
}

// 6. Vérifier Email
console.log('\n📧 5. Emails...');
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    checks.passed.push('✅ Service email configuré');
} else {
    checks.warnings.push('⚠️  Service email non configuré (pas de notifications)');
}

// 7. Vérifier NODE_ENV
console.log('\n🌍 6. Environnement...');
if (process.env.NODE_ENV === 'production') {
    checks.passed.push('✅ NODE_ENV = production');
} else {
    checks.failed.push('❌ NODE_ENV doit être "production"');
}

// 8. Vérifier FRONTEND_URL
if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost')) {
    checks.passed.push('✅ FRONTEND_URL configuré pour production');
} else {
    checks.failed.push('❌ FRONTEND_URL utilise localhost');
}

// Afficher les résultats
console.log('\n' + '═'.repeat(60));
console.log('\n📋 RÉSULTATS:\n');

if (checks.passed.length > 0) {
    console.log('✅ RÉUSSI:');
    checks.passed.forEach(check => console.log('   ' + check));
}

if (checks.warnings.length > 0) {
    console.log('\n⚠️  AVERTISSEMENTS:');
    checks.warnings.forEach(check => console.log('   ' + check));
}

if (checks.failed.length > 0) {
    console.log('\n❌ ÉCHECS CRITIQUES:');
    checks.failed.forEach(check => console.log('   ' + check));
}

console.log('\n' + '═'.repeat(60));

if (checks.failed.length === 0) {
    console.log('\n🎉 PRÊT POUR LA PRODUCTION!');
    console.log('\nCommandes de déploiement:');
    console.log('  1. npm run build (frontend & admin)');
    console.log('  2. node scripts/createIndexes.js');
    console.log('  3. NODE_ENV=production npm start');
    process.exit(0);
} else {
    console.log('\n⛔ PAS PRÊT - Corrigez les erreurs ci-dessus');
    console.log('\nModifiez .env.production et relancez ce script');
    process.exit(1);
}
