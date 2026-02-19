import 'dotenv/config';
import nodemailer from 'nodemailer';

console.log('🔍 Test de connexion Brevo SMTP\n');
console.log('Configuration:');
console.log('- Host:', process.env.EMAIL_HOST);
console.log('- Port:', process.env.EMAIL_PORT);
console.log('- User:', process.env.EMAIL_USER);
console.log('- Pass:', process.env.EMAIL_PASS?.substring(0, 20) + '...');
console.log();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});

console.log('Test de connexion...\n');

try {
    await transporter.verify();
    console.log('✅ Connexion réussie!');
    console.log('Le serveur SMTP est prêt à envoyer des emails.');
} catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('\n📝 Actions à faire:');
    console.error('1. Vérifier que votre compte Brevo est actif');
    console.error('2. Créer une nouvelle clé API SMTP sur: https://app.brevo.com/settings/keys/smtp');
    console.error('3. Remplacer EMAIL_PASS dans .env avec la nouvelle clé');
    process.exit(1);
}
