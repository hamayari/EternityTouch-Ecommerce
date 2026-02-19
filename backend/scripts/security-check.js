import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔒 VÉRIFICATION DE SÉCURITÉ\n');
console.log('='.repeat(60));

let issues = [];
let warnings = [];
let passed = [];

// 1. Vérifier que .env n'est pas commité
console.log('\n1. Vérification .gitignore...');
const gitignorePath = path.join(__dirname, '../.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignore.includes('.env')) {
        passed.push('✅ .env est dans .gitignore');
    } else {
        issues.push('❌ .env n\'est PAS dans .gitignore!');
    }
} else {
    issues.push('❌ .gitignore n\'existe pas!');
}

// 2. Vérifier JWT_SECRET
console.log('2. Vérification JWT_SECRET...');
if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) {
        passed.push('✅ JWT_SECRET est suffisamment long');
    } else {
        warnings.push('⚠️  JWT_SECRET devrait faire au moins 32 caractères');
    }
} else {
    issues.push('❌ JWT_SECRET n\'est pas défini!');
}

// 3. Vérifier NODE_ENV
console.log('3. Vérification NODE_ENV...');
if (process.env.NODE_ENV) {
    passed.push(`✅ NODE_ENV = ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'production') {
        warnings.push('⚠️  MODE PRODUCTION - Vérifier toutes les clés!');
    }
} else {
    warnings.push('⚠️  NODE_ENV n\'est pas défini (défaut: development)');
}

// 4. Vérifier MongoDB
console.log('4. Vérification MongoDB...');
if (process.env.MONGODB_URI) {
    if (process.env.MONGODB_URI.includes('localhost') || process.env.MONGODB_URI.includes('127.0.0.1')) {
        if (process.env.NODE_ENV === 'production') {
            issues.push('❌ MongoDB local en PRODUCTION!');
        } else {
            passed.push('✅ MongoDB local (OK pour dev)');
        }
    } else if (process.env.MONGODB_URI.includes('mongodb+srv')) {
        passed.push('✅ MongoDB Atlas (cloud)');
    }
} else {
    issues.push('❌ MONGODB_URI n\'est pas défini!');
}

// 5. Vérifier Stripe
console.log('5. Vérification Stripe...');
if (process.env.STRIPE_SECRET_KEY) {
    if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test')) {
        if (process.env.NODE_ENV === 'production') {
            issues.push('❌ Stripe en mode TEST en PRODUCTION!');
        } else {
            passed.push('✅ Stripe mode test (OK pour dev)');
        }
    } else if (process.env.STRIPE_SECRET_KEY.startsWith('sk_live')) {
        if (process.env.NODE_ENV === 'production') {
            passed.push('✅ Stripe mode LIVE (production)');
        } else {
            warnings.push('⚠️  Stripe mode LIVE en développement!');
        }
    }
} else {
    warnings.push('⚠️  STRIPE_SECRET_KEY n\'est pas défini');
}

// 6. Vérifier CORS
console.log('6. Vérification CORS URLs...');
if (process.env.FRONTEND_URL && process.env.ADMIN_URL) {
    if (process.env.NODE_ENV === 'production') {
        if (process.env.FRONTEND_URL.startsWith('https://') && process.env.ADMIN_URL.startsWith('https://')) {
            passed.push('✅ URLs en HTTPS (production)');
        } else {
            issues.push('❌ URLs doivent être en HTTPS en production!');
        }
    } else {
        passed.push('✅ URLs configurées');
    }
} else {
    warnings.push('⚠️  FRONTEND_URL ou ADMIN_URL non définis');
}

// 7. Vérifier Email
console.log('7. Vérification Email...');
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    passed.push('✅ Email configuré');
} else {
    warnings.push('⚠️  Email pas complètement configuré');
}

// 8. Vérifier packages de sécurité
console.log('8. Vérification packages...');
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const securityPackages = ['helmet', 'express-mongo-sanitize', 'xss-clean', 'express-rate-limit'];
    
    securityPackages.forEach(pkg => {
        if (packageJson.dependencies[pkg]) {
            passed.push(`✅ ${pkg} installé`);
        } else {
            warnings.push(`⚠️  ${pkg} n'est pas installé`);
        }
    });
}

// Afficher les résultats
console.log('\n' + '='.repeat(60));
console.log('\n📊 RÉSULTATS:\n');

if (passed.length > 0) {
    console.log('✅ PASSED (' + passed.length + '):');
    passed.forEach(p => console.log('  ' + p));
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + warnings.length + '):');
    warnings.forEach(w => console.log('  ' + w));
}

if (issues.length > 0) {
    console.log('\n❌ ISSUES CRITIQUES (' + issues.length + '):');
    issues.forEach(i => console.log('  ' + i));
}

console.log('\n' + '='.repeat(60));

if (issues.length === 0) {
    console.log('\n✅ SÉCURITÉ: BONNE');
    if (warnings.length > 0) {
        console.log('⚠️  Quelques avertissements à vérifier');
    }
} else {
    console.log('\n❌ SÉCURITÉ: PROBLÈMES TROUVÉS');
    console.log('Corriger les issues critiques avant production!');
}

console.log('\n');

// Exit code
process.exit(issues.length > 0 ? 1 : 0);
