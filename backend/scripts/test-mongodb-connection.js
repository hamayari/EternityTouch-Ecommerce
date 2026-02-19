/**
 * Test MongoDB Connection
 * Vérifie que la connexion MongoDB fonctionne
 */

import mongoose from 'mongoose';
import 'dotenv/config';

console.log('🔍 Test de connexion MongoDB...\n');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI non défini dans .env');
    console.log('💡 Ajoute MONGODB_URI dans ton fichier .env\n');
    process.exit(1);
}

console.log('📡 Connexion à:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('⏳ Connexion en cours...\n');

const timeout = setTimeout(() => {
    console.error('❌ Timeout: Connexion trop longue (30s)');
    console.log('\n💡 Vérifications:');
    console.log('   1. MongoDB Atlas est accessible?');
    console.log('   2. IP autorisée (0.0.0.0/0)?');
    console.log('   3. User/password corrects?');
    console.log('   4. URL correcte?\n');
    process.exit(1);
}, 30000);

mongoose.connect(MONGODB_URI)
    .then(async () => {
        clearTimeout(timeout);
        console.log('✅ Connexion réussie!\n');
        
        // Test database operations
        console.log('🧪 Test des opérations...');
        
        try {
            // List collections
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`   ✅ ${collections.length} collection(s) trouvée(s)`);
            
            if (collections.length > 0) {
                console.log('   📦 Collections:');
                collections.forEach(col => {
                    console.log(`      - ${col.name}`);
                });
            }
            
            // Test write operation
            const testCollection = mongoose.connection.db.collection('_test');
            await testCollection.insertOne({ test: true, timestamp: new Date() });
            console.log('   ✅ Écriture OK');
            
            // Test read operation
            const doc = await testCollection.findOne({ test: true });
            console.log('   ✅ Lecture OK');
            
            // Cleanup
            await testCollection.deleteOne({ test: true });
            console.log('   ✅ Suppression OK');
            
            console.log('\n═══════════════════════════════════════════════════════');
            console.log('✅ SUCCÈS: MongoDB est prêt pour le déploiement!');
            console.log('═══════════════════════════════════════════════════════\n');
            
        } catch (error) {
            console.error('\n❌ Erreur lors des opérations:', error.message);
            console.log('💡 La connexion fonctionne mais les opérations échouent');
            console.log('   Vérifie les permissions de l\'utilisateur MongoDB\n');
        }
        
        await mongoose.connection.close();
        process.exit(0);
    })
    .catch((error) => {
        clearTimeout(timeout);
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\n💡 Vérifications:');
        console.log('   1. MongoDB Atlas est accessible?');
        console.log('   2. IP autorisée dans Network Access (0.0.0.0/0)?');
        console.log('   3. Username/password corrects?');
        console.log('   4. Format URL correct?');
        console.log('      mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority');
        console.log('\n📖 Guide: https://www.mongodb.com/docs/atlas/getting-started/\n');
        process.exit(1);
    });
