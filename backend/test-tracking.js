// Script de test pour vérifier le tracking avant production
import { getTracking, isTrackingEnabled } from './services/trackingService.js';

async function testTracking() {
    console.log('🧪 Testing AfterShip Integration...\n');
    
    // Test 1: Vérifier si AfterShip est configuré
    console.log('Test 1: Checking AfterShip configuration...');
    if (isTrackingEnabled()) {
        console.log('✅ AfterShip is configured\n');
    } else {
        console.log('❌ AfterShip is NOT configured\n');
        return;
    }
    
    // Test 2: Tester avec un numéro de tracking
    console.log('Test 2: Testing with tracking number...');
    const testTrackingNumber = '1234567890'; // Remplacez par un vrai numéro
    const testCourier = 'dhl';
    
    try {
        const result = await getTracking(testTrackingNumber, testCourier);
        console.log('✅ Tracking data retrieved successfully');
        console.log('Status:', result.tag);
        console.log('Checkpoints:', result.checkpoints?.length || 0);
        console.log('\n');
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Note: This is expected if using a fake tracking number\n');
    }
    
    console.log('🎉 Test completed!');
    console.log('\nRECOMMENDATIONS:');
    console.log('1. Test with a REAL tracking number before production');
    console.log('2. Monitor logs for [TRACKING] messages');
    console.log('3. Check AfterShip dashboard for API usage');
    console.log('4. Ensure you have enough API credits (50/month on free plan)');
}

testTracking();
