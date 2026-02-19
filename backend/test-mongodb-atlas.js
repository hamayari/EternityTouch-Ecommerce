import mongoose from 'mongoose';
import 'dotenv/config';

console.log('🔄 Testing MongoDB Atlas connection...');
console.log('URI:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🌍 Host:', mongoose.connection.host);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        console.error('💡 Troubleshooting:');
        console.error('   1. Check Network Access in MongoDB Atlas');
        console.error('   2. Add your IP: 0.0.0.0/0 (Allow from anywhere)');
        console.error('   3. Verify username and password');
        console.error('   4. Wait 1-2 minutes for cluster to be ready');
        process.exit(1);
    });
