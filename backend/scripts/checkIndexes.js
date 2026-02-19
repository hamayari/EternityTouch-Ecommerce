// Script pour vérifier les index MongoDB existants
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('📊 MongoDB Index Report\n');
        console.log('='.repeat(80));

        let totalIndexes = 0;

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = db.collection(collectionName);
            const indexes = await collection.indexes();

            console.log(`\n📁 Collection: ${collectionName}`);
            console.log(`   Indexes: ${indexes.length}`);
            
            indexes.forEach((index, i) => {
                const keys = Object.keys(index.key).map(k => {
                    const direction = index.key[k] === 1 ? '↑' : index.key[k] === -1 ? '↓' : index.key[k];
                    return `${k}:${direction}`;
                }).join(', ');
                
                const unique = index.unique ? ' [UNIQUE]' : '';
                const sparse = index.sparse ? ' [SPARSE]' : '';
                const text = index.textIndexVersion ? ' [TEXT]' : '';
                
                console.log(`   ${i + 1}. ${index.name}: ${keys}${unique}${sparse}${text}`);
            });

            totalIndexes += indexes.length;
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n✅ Total collections: ${collections.length}`);
        console.log(`✅ Total indexes: ${totalIndexes}`);
        console.log('\n💡 To create missing indexes, run: npm run create-indexes\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking indexes:', error);
        process.exit(1);
    }
};

checkIndexes();
