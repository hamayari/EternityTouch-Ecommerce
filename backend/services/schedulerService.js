import cron from 'node-cron';
import { syncTrackingStatuses, cancelUnpaidOrders } from './orderAutomationService.js';
import { detectAbandonedCarts, sendRecoveryEmails, cleanupExpiredCarts } from './abandonedCartService.js';

/**
 * 🕐 SCHEDULER SERVICE
 * Exécute les tâches automatiques périodiquement
 */

export const startScheduler = () => {
  console.log('🤖 Starting automation scheduler...');

  // 🔄 Sync tracking statuses every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[SCHEDULER] Running tracking sync...');
    await syncTrackingStatuses();
  });

  // ⏱️ Cancel unpaid orders every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[SCHEDULER] Checking for unpaid orders...');
    await cancelUnpaidOrders(30); // Cancel after 30 minutes
  });

  // 🛒 Detect abandoned carts every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[SCHEDULER] Detecting abandoned carts...');
    await detectAbandonedCarts();
  });

  // 📧 Send recovery emails every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[SCHEDULER] Sending abandoned cart recovery emails...');
    await sendRecoveryEmails();
  });

  // 📊 Daily cleanup at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('[SCHEDULER] Running daily cleanup...');
    await cleanupExpiredCarts();
  });

  console.log('✅ Scheduler started successfully');
  console.log('   - Tracking sync: every 30 minutes');
  console.log('   - Unpaid orders check: every hour');
  console.log('   - Abandoned cart detection: every 30 minutes');
  console.log('   - Recovery emails: every hour');
  console.log('   - Daily cleanup: 3:00 AM');
};
