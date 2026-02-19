// Test si dotenv charge correctement les variables
import 'dotenv/config';

console.log('\n=== TEST CHARGEMENT VARIABLES ENV ===\n');

console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 20)}... (${process.env.EMAIL_PASS.length} chars)` : '❌ UNDEFINED');

console.log('\n=== TEST NODEMAILER ===\n');

import nodemailer from 'nodemailer';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Les credentials ne sont PAS chargés!');
    console.log('\nContenu du fichier .env:');
    import('fs').then(fs => {
        const content = fs.readFileSync('.env', 'utf8');
        const emailLines = content.split('\n').filter(line => line.startsWith('EMAIL'));
        emailLines.forEach(line => console.log(line));
    });
    process.exit(1);
}

console.log('✅ Les credentials sont chargés');

// Test connexion
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('\nTest de connexion SMTP...');

try {
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie!');
} catch (error) {
    console.error('❌ Erreur connexion:', error.message);
}
