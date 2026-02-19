import nodemailer from 'nodemailer';

console.log('🔧 Création d\'un compte email de test Ethereal...\n');

// Créer un compte de test Ethereal
const testAccount = await nodemailer.createTestAccount();

console.log('✅ Compte créé avec succès!\n');
console.log('Ajoutez ces lignes dans votre fichier .env:\n');
console.log('EMAIL_HOST=' + testAccount.smtp.host);
console.log('EMAIL_PORT=' + testAccount.smtp.port);
console.log('EMAIL_USER=' + testAccount.user);
console.log('EMAIL_PASS=' + testAccount.pass);
console.log('\n📧 Pour voir les emails envoyés, allez sur:');
console.log('https://ethereal.email/messages');
console.log('\nLogin:', testAccount.user);
console.log('Password:', testAccount.pass);
