// Backup simple sans mongodump (utilise Mongoose)
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';

dotenv.config();

const BACKUP_DIR = './backups';
const MAX_BACKUPS = 7;

// Créer le dossier de backup
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Fonction de backup
const createBackup = async () => {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.json`);
        
        console.log(`🔄 Starting backup: ${timestamp}`);
        
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Récupérer toutes les données
        console.log('📦 Fetching data...');
        const users = await userModel.find({}).lean();
        const products = await productModel.find({}).lean();
        const orders = await orderModel.find({}).lean();
        
        // Créer l'objet de backup
        const backup = {
            timestamp: new Date().toISOString(),
            collections: {
                users: users,
                products: products,
                orders: orders
            },
            stats: {
                users: users.length,
                products: products.length,
                orders: orders.length
            }
        };
        
        // Sauvegarder dans un fichier JSON
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        
        const fileSize = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2);
        console.log(`✅ Backup completed: ${backupFile}`);
        console.log(`📊 Stats:`);
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Products: ${products.length}`);
        console.log(`   - Orders: ${orders.length}`);
        console.log(`   - File size: ${fileSize} MB`);
        
        // Nettoyer les vieux backups
        cleanOldBackups();
        
        await mongoose.disconnect();
        process.exit(0);
        
    } catch (error) {
        console.error(`❌ Backup failed: ${error.message}`);
        process.exit(1);
    }
};

// Fonction de restauration
const restoreBackup = async (backupName) => {
    try {
        const backupFile = path.join(BACKUP_DIR, `${backupName}.json`);
        
        if (!fs.existsSync(backupFile)) {
            console.error(`❌ Backup not found: ${backupName}`);
            process.exit(1);
        }
        
        console.log(`🔄 Restoring backup: ${backupName}`);
        
        // Lire le fichier de backup
        const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // Demander confirmation
        console.log('⚠️  WARNING: This will DELETE all current data!');
        console.log(`📊 Backup contains:`);
        console.log(`   - Users: ${backupData.stats.users}`);
        console.log(`   - Products: ${backupData.stats.products}`);
        console.log(`   - Orders: ${backupData.stats.orders}`);
        console.log(`   - Created: ${backupData.timestamp}`);
        
        // Restaurer les données
        console.log('\n🔄 Restoring data...');
        
        // Supprimer les données existantes
        await userModel.deleteMany({});
        await productModel.deleteMany({});
        await orderModel.deleteMany({});
        console.log('✅ Cleared existing data');
        
        // Insérer les données du backup
        if (backupData.collections.users.length > 0) {
            await userModel.insertMany(backupData.collections.users);
            console.log(`✅ Restored ${backupData.collections.users.length} users`);
        }
        
        if (backupData.collections.products.length > 0) {
            await productModel.insertMany(backupData.collections.products);
            console.log(`✅ Restored ${backupData.collections.products.length} products`);
        }
        
        if (backupData.collections.orders.length > 0) {
            await orderModel.insertMany(backupData.collections.orders);
            console.log(`✅ Restored ${backupData.collections.orders.length} orders`);
        }
        
        console.log('\n✅ Restore completed successfully!');
        
        await mongoose.disconnect();
        process.exit(0);
        
    } catch (error) {
        console.error(`❌ Restore failed: ${error.message}`);
        process.exit(1);
    }
};

// Lister les backups
const listBackups = () => {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();
    
    if (backups.length === 0) {
        console.log('📦 No backups found. Run "npm run backup" to create one.');
        return;
    }
    
    console.log('\n📦 Available backups:\n');
    backups.forEach((backup, index) => {
        const backupPath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(backupPath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString();
        
        // Lire les stats du backup
        try {
            const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            console.log(`  ${index + 1}. ${backup.replace('.json', '')}`);
            console.log(`     Size: ${size} MB | Created: ${date}`);
            console.log(`     Users: ${data.stats.users} | Products: ${data.stats.products} | Orders: ${data.stats.orders}\n`);
        } catch (e) {
            console.log(`  ${index + 1}. ${backup} (${size} MB) - ${date}`);
        }
    });
};

// Nettoyer les vieux backups
const cleanOldBackups = () => {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();
    
    if (backups.length > MAX_BACKUPS) {
        const toDelete = backups.slice(MAX_BACKUPS);
        toDelete.forEach(backup => {
            const backupPath = path.join(BACKUP_DIR, backup);
            fs.unlinkSync(backupPath);
            console.log(`🗑️  Deleted old backup: ${backup}`);
        });
    }
};

// Exécuter selon l'argument
const command = process.argv[2];

if (command === 'backup') {
    createBackup();
} else if (command === 'restore' && process.argv[3]) {
    restoreBackup(process.argv[3]);
} else if (command === 'list') {
    listBackups();
} else {
    console.log('Usage:');
    console.log('  npm run backup              - Create a backup');
    console.log('  npm run backup:list         - List all backups');
    console.log('  npm run backup:restore <name> - Restore a backup');
    console.log('\nExample:');
    console.log('  npm run backup:restore backup-2026-02-05');
}
