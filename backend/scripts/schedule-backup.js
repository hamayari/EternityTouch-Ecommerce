// Planificateur de backups automatiques (à utiliser avec cron ou PM2)
import cron from 'node-cron';
import { exec } from 'child_process';

console.log('📅 Backup scheduler started');
console.log('⏰ Backups will run daily at 2:00 AM');

// Backup quotidien à 2h du matin
cron.schedule('0 2 * * *', () => {
    console.log(`\n🔄 [${new Date().toISOString()}] Starting scheduled backup...`);
    
    exec('npm run backup', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Scheduled backup failed: ${error.message}`);
            return;
        }
        console.log(stdout);
        console.log('✅ Scheduled backup completed\n');
    });
});

// Garder le processus actif
process.on('SIGINT', () => {
    console.log('\n👋 Backup scheduler stopped');
    process.exit(0);
});
