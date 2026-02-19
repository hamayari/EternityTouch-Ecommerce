/**
 * Pre-Deployment Checklist
 * Vérifie que tout est prêt pour le déploiement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification avant déploiement...\n');

let errors = 0;
let warnings = 0;

// Check 1: server.js exists
console.log('1️⃣  Vérification du fichier server.js...');
const serverPath = path.join(__dirname, '..', 'server.js');
if (fs.existsSync(serverPath)) {
    console.log('   ✅ server.js existe\n');
} else {
    console.log('   ❌ server.js manquant!\n');
    errors++;
}

// Check 2: package.json has correct scripts
console.log('2️⃣  Vérification des scripts npm...');
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (packageJson.scripts.start) {
    console.log('   ✅ Script "start" configuré:', packageJson.scripts.start);
} else {
    console.log('   ❌ Script "start" manquant!');
    errors++;
}

if (packageJson.scripts.prod) {
    console.log('   ✅ Script "prod" configuré:', packageJson.scripts.prod);
} else {
    console.log('   ⚠️  Script "prod" manquant (optionnel)');
    warnings++;
}
console.log();

// Check 3: .gitignore exists
console.log('3️⃣  Vérification du .gitignore...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignore.includes('.env')) {
        console.log('   ✅ .gitignore protège les fichiers .env\n');
    } else {
        console.log('   ⚠️  .gitignore ne protège pas les .env!');
        warnings++;
    }
} else {
    console.log('   ❌ .gitignore manquant!\n');
    errors++;
}

// Check 4: .env.production exists
console.log('4️⃣  Vérification de .env.production...');
const envProdPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envProdPath)) {
    console.log('   ✅ .env.production existe');
    console.log('   ⚠️  N\'oublie pas de copier ces variables sur Render!\n');
} else {
    console.log('   ⚠️  .env.production manquant');
    console.log('   💡 Exécute: node scripts/generate-production-secrets.js\n');
    warnings++;
}

// Check 5: Dependencies
console.log('5️⃣  Vérification des dépendances critiques...');
const requiredDeps = [
    'express',
    'mongoose',
    'cors',
    'dotenv',
    'helmet',
    'jsonwebtoken',
    'bcrypt'
];

let missingDeps = [];
requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
        missingDeps.push(dep);
    }
});

if (missingDeps.length === 0) {
    console.log('   ✅ Toutes les dépendances critiques sont présentes\n');
} else {
    console.log('   ❌ Dépendances manquantes:', missingDeps.join(', '));
    errors++;
}

// Check 6: Test if tests pass
console.log('6️⃣  Vérification des tests...');
console.log('   💡 Exécute: npm test');
console.log('   💡 Tous les tests doivent passer avant déploiement!\n');

// Check 7: Environment variables template
console.log('7️⃣  Variables d\'environnement requises:');
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS',
    'FRONTEND_URL',
    'CURRENCY',
    'DELIVERY_FEE'
];

console.log('   📋 Variables à configurer sur Render:');
requiredEnvVars.forEach(varName => {
    console.log(`      - ${varName}`);
});
console.log();

// Check 8: Security
console.log('8️⃣  Vérification de sécurité...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('JWT_SECRET=') && envContent.match(/JWT_SECRET=.{64,}/)) {
        console.log('   ✅ JWT_SECRET semble sécurisé (64+ caractères)');
    } else {
        console.log('   ⚠️  JWT_SECRET trop court! Génère-en un nouveau');
        warnings++;
    }
    
    if (envContent.includes('ADMIN_PASSWORD=Admin@123')) {
        console.log('   ⚠️  ADMIN_PASSWORD par défaut détecté!');
        console.log('      Change-le avant déploiement!');
        warnings++;
    } else {
        console.log('   ✅ ADMIN_PASSWORD personnalisé');
    }
} else {
    console.log('   ⚠️  Fichier .env non trouvé (normal si déjà déployé)');
}
console.log();

// Check 9: Build test
console.log('9️⃣  Test de build...');
console.log('   💡 Vérifie que "npm install" fonctionne sans erreur\n');

// Check 10: Git
console.log('🔟 Vérification Git...');
const gitPath = path.join(__dirname, '..', '..', '.git');
if (fs.existsSync(gitPath)) {
    console.log('   ✅ Dépôt Git initialisé');
    console.log('   💡 N\'oublie pas de push sur GitHub!\n');
} else {
    console.log('   ⚠️  Git non initialisé');
    console.log('   💡 Exécute: git init\n');
    warnings++;
}

// Summary
console.log('═══════════════════════════════════════════════════════');
console.log('📊 RÉSUMÉ\n');

if (errors === 0 && warnings === 0) {
    console.log('✅ Tout est prêt pour le déploiement!');
    console.log('\n🚀 Prochaines étapes:');
    console.log('   1. Push ton code sur GitHub');
    console.log('   2. Crée un compte sur Render.com');
    console.log('   3. Configure MongoDB Atlas');
    console.log('   4. Déploie sur Render');
    console.log('\n📖 Guide complet: DEPLOYMENT_GUIDE.md');
} else {
    if (errors > 0) {
        console.log(`❌ ${errors} erreur(s) critique(s) à corriger`);
    }
    if (warnings > 0) {
        console.log(`⚠️  ${warnings} avertissement(s) à vérifier`);
    }
    console.log('\n🔧 Corrige les problèmes avant de déployer');
}

console.log('═══════════════════════════════════════════════════════\n');

process.exit(errors > 0 ? 1 : 0);
