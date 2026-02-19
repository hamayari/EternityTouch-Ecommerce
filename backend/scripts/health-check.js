#!/usr/bin/env node

/**
 * 🏥 HEALTH CHECK SCRIPT
 * Test the health check endpoint and display service status
 */

import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const checkHealth = async () => {
    try {
        console.log('🏥 Checking server health...\n');
        console.log(`Target: ${BACKEND_URL}/api/health\n`);

        const response = await fetch(`${BACKEND_URL}/api/health`);
        const data = await response.json();

        // Display status
        const statusEmoji = data.status === 'ok' ? '✅' : data.status === 'degraded' ? '⚠️' : '❌';
        console.log(`${statusEmoji} Overall Status: ${data.status.toUpperCase()}`);
        console.log(`📅 Timestamp: ${data.timestamp}`);
        console.log(`⏱️  Uptime: ${Math.floor(data.uptime / 60)} minutes ${Math.floor(data.uptime % 60)} seconds`);
        console.log(`🌍 Environment: ${data.environment}`);

        // Display services
        console.log('\n📊 Services Status:');
        console.log('─'.repeat(60));
        
        for (const [service, info] of Object.entries(data.services)) {
            const serviceEmoji = info.status === 'connected' || info.status === 'configured' ? '✅' : '⚠️';
            console.log(`${serviceEmoji} ${service.padEnd(15)} : ${info.status.padEnd(15)} - ${info.message}`);
        }

        // Display memory usage
        if (data.memory) {
            console.log('\n💾 Memory Usage:');
            console.log('─'.repeat(60));
            console.log(`RSS:        ${data.memory.rss}`);
            console.log(`Heap Used:  ${data.memory.heapUsed}`);
            console.log(`Heap Total: ${data.memory.heapTotal}`);
        }

        console.log('\n' + '─'.repeat(60));
        
        if (response.status === 200) {
            console.log('✅ Server is healthy and ready to accept requests\n');
            process.exit(0);
        } else {
            console.log('⚠️  Server is running but some services are degraded\n');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        console.error('\n💡 Make sure the server is running on', BACKEND_URL);
        process.exit(1);
    }
};

// Check readiness
const checkReadiness = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/ready`);
        const data = await response.json();
        
        if (data.ready) {
            console.log('✅ Service is ready');
        } else {
            console.log('⚠️  Service not ready:', data.message);
        }
    } catch (error) {
        console.error('❌ Readiness check failed:', error.message);
    }
};

// Check liveness
const checkLiveness = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/live`);
        const data = await response.json();
        
        if (data.alive) {
            console.log('✅ Service is alive');
        } else {
            console.log('❌ Service is not alive');
        }
    } catch (error) {
        console.error('❌ Liveness check failed:', error.message);
    }
};

// Parse command line arguments
const command = process.argv[2];

switch (command) {
    case 'ready':
        checkReadiness();
        break;
    case 'live':
        checkLiveness();
        break;
    case 'all':
        (async () => {
            await checkHealth();
            await checkReadiness();
            await checkLiveness();
        })();
        break;
    default:
        checkHealth();
}
