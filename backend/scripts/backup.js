// Script de backup automatique MongoDB
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const BACKUP_DIR = './backups';
const MAX_BACKUPS = 7; // Garder 7 jours de backups

// Créer le dossier de backup s'il n'existe pas
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Fonction de backup
const createBackup = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    console.log(`🔄 Starting backup: ${timestamp}`);
    
    // Extraire les infos de connexion MongoDB
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.error('❌ MONGODB_URI not found in .env');
        process.exit(1);
    }
    
    // Commande mongodump
    const command = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Backup failed: ${error.message}`);
            return;
        }
        
        if (stderr) {
            console.error(`⚠️  Warning: ${stderr}`);
        }
        
        console.log(`✅ Backup completed: ${backupPath}`);
        console.log(stdout);
        
        // Nettoyer les vieux backups
        cleanOldBackups();
    });
};

// Nettoyer les backups de plus de MAX_BACKUPS jours
const cleanOldBackups = () => {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
    
    if (backups.length > MAX_BACKUPS) {
        const toDelete = backups.slice(MAX_BACKUPS);
        toDelete.forEach(backup => {
            const backupPath = path.join(BACKUP_DIR, backup);
            fs.rmSync(backupPath, { recursive: true, force: true });
            console.log(`🗑️  Deleted old backup: ${backup}`);
        });
    }
};

// Fonction de restauration
export const restoreBackup = (backupName) => {
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Backup not found: ${backupName}`);
        return;
    }
    
    console.log(`🔄 Restoring backup: ${backupName}`);
    
    const mongoUri = process.env.MONGODB_URI;
    const command = `mongorestore --uri="${mongoUri}" --drop "${backupPath}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Restore failed: ${error.message}`);
            return;
        }
        
        console.log(`✅ Restore completed from: ${backupName}`);
        console.log(stdout);
    });
};

// Lister les backups disponibles
export const listBackups = () => {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
        .filter(f => f.startsWith('backup-'))
        .sort()
        .reverse();
    
    console.log('\n📦 Available backups:');
    backups.forEach((backup, index) => {
        const stats = fs.statSync(path.join(BACKUP_DIR, backup));
        const size = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  ${index + 1}. ${backup} (${size} MB)`);
    });
    console.log('');
};

// Exécuter le backup
if (process.argv[2] === 'backup') {
    createBackup();
} else if (process.argv[2] === 'restore' && process.argv[3]) {
    restoreBackup(process.argv[3]);
} else if (process.argv[2] === 'list') {
    listBackups();
} else {
    console.log('Usage:');
    console.log('  node scripts/backup.js backup          - Create a backup');
    console.log('  node scripts/backup.js list            - List all backups');
    console.log('  node scripts/backup.js restore <name>  - Restore a backup');
}
