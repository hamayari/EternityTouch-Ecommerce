import orderModel from '../models/orderModel.js';
import { sendOrderConfirmation, sendTrackingUpdate } from './emailService.js';
import userModel from '../models/userModel.js';
import { getTracking } from './trackingService.js';

/**
 * 🤖 SERVICE D'AUTOMATISATION DES STATUTS DE COMMANDE
 * Change automatiquement les statuts basé sur les événements
 */

// 💳 EVENT: Payment Success → Status = "Packing"
export const handlePaymentSuccess = async (orderId) => {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return;

    // Auto-update status après paiement
    order.status = 'Packing';
    order.payment = true;
    await order.save();

    console.log(`[AUTOMATION] Order ${orderId}: Payment Success → Status: Packing`);

    // Notification email
    const user = await userModel.findById(order.userId);
    if (user?.email) {
      await sendOrderConfirmation(user.email, {
        orderId: order._id,
        amount: order.amount,
        status: 'Packing',
        paymentMethod: order.paymentMethod,
        items: order.items,
        address: order.address
      });
    }

    return order;
  } catch (error) {
    console.error('[AUTOMATION] Error in handlePaymentSuccess:', error);
  }
};

// 📦 EVENT: Tracking Added → Status = "Shipped"
export const handleTrackingAdded = async (orderId) => {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return;

    // Auto-update status quand tracking ajouté
    order.status = 'Shipped';
    await order.save();

    console.log(`[AUTOMATION] Order ${orderId}: Tracking Added → Status: Shipped`);

    // Notification email
    const user = await userModel.findById(order.userId);
    if (user?.email && order.trackingNumber) {
      await sendTrackingUpdate(user.email, {
        orderId: order._id,
        trackingNumber: order.trackingNumber,
        courier: order.courier,
        trackingUrl: order.trackingUrl
      });
    }

    return order;
  } catch (error) {
    console.error('[AUTOMATION] Error in handleTrackingAdded:', error);
  }
};

// 🚚 EVENT: Tracking Status = "Out for Delivery" → Status = "Out for delivery"
export const handleOutForDelivery = async (orderId) => {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return;

    order.status = 'Out for delivery';
    await order.save();

    console.log(`[AUTOMATION] Order ${orderId}: Tracking Update → Status: Out for delivery`);

    return order;
  } catch (error) {
    console.error('[AUTOMATION] Error in handleOutForDelivery:', error);
  }
};

// ✅ EVENT: Tracking Status = "Delivered" → Status = "Delivered"
export const handleDelivered = async (orderId) => {
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return;

    order.status = 'Delivered';
    await order.save();

    console.log(`[AUTOMATION] Order ${orderId}: Tracking Update → Status: Delivered`);

    return order;
  } catch (error) {
    console.error('[AUTOMATION] Error in handleDelivered:', error);
  }
};

// 🔄 CRON JOB: Sync tracking status from AfterShip
export const syncTrackingStatuses = async () => {
  try {
    // Récupérer toutes les commandes avec tracking mais pas encore livrées
    const orders = await orderModel.find({
      trackingNumber: { $exists: true, $ne: '' },
      status: { $nin: ['Delivered', 'Cancelled'] }
    });

    console.log(`[AUTOMATION] Syncing ${orders.length} orders with tracking...`);

    for (const order of orders) {
      try {
        // Récupérer le statut depuis AfterShip
        const tracking = await getTracking(order.trackingNumber, order.courier);
        
        // Mapper les statuts AfterShip vers nos statuts
        const statusMap = {
          'InfoReceived': 'Packing',
          'InTransit': 'Shipped',
          'OutForDelivery': 'Out for delivery',
          'Delivered': 'Delivered',
          'Exception': 'Shipped', // Problème mais toujours en transit
          'Expired': 'Shipped'
        };

        const newStatus = statusMap[tracking.tag] || order.status;

        // Update si le statut a changé
        if (newStatus !== order.status) {
          order.status = newStatus;
          
          // Update estimated delivery
          if (tracking.expected_delivery) {
            order.estimatedDelivery = new Date(tracking.expected_delivery);
          }
          
          // Update last checkpoint
          if (tracking.checkpoints && tracking.checkpoints.length > 0) {
            order.lastCheckpoint = tracking.checkpoints[tracking.checkpoints.length - 1];
          }
          
          await order.save();
          
          console.log(`[AUTOMATION] Order ${order._id}: ${order.status} → ${newStatus}`);
        }
      } catch (error) {
        console.error(`[AUTOMATION] Error syncing order ${order._id}:`, error.message);
        // Continue avec les autres commandes
      }
    }

    console.log('[AUTOMATION] Tracking sync completed');
  } catch (error) {
    console.error('[AUTOMATION] Error in syncTrackingStatuses:', error);
  }
};

// ⏱️ AUTO-CANCEL: Cancel unpaid orders after X minutes
export const cancelUnpaidOrders = async (minutesThreshold = 30) => {
  try {
    const threshold = new Date(Date.now() - minutesThreshold * 60 * 1000);
    
    const unpaidOrders = await orderModel.find({
      payment: false,
      paymentMethod: { $ne: 'COD' }, // Ne pas annuler les COD
      status: 'Order Placed',
      date: { $lt: threshold }
    });

    for (const order of unpaidOrders) {
      order.status = 'Cancelled';
      await order.save();
      console.log(`[AUTOMATION] Order ${order._id} auto-cancelled (unpaid after ${minutesThreshold} min)`);
    }

    if (unpaidOrders.length > 0) {
      console.log(`[AUTOMATION] Cancelled ${unpaidOrders.length} unpaid orders`);
    }
  } catch (error) {
    console.error('[AUTOMATION] Error in cancelUnpaidOrders:', error);
  }
};

// 🎯 SMART STATUS ENGINE: Determine next status based on current state
export const getNextStatus = (currentStatus, event) => {
  const statusFlow = {
    'Order Placed': {
      'payment_success': 'Packing',
      'payment_failed': 'Cancelled'
    },
    'Packing': {
      'tracking_added': 'Shipped',
      'ready_to_ship': 'Shipped'
    },
    'Shipped': {
      'out_for_delivery': 'Out for delivery',
      'delivered': 'Delivered'
    },
    'Out for delivery': {
      'delivered': 'Delivered',
      'failed_delivery': 'Shipped' // Retour au centre
    }
  };

  return statusFlow[currentStatus]?.[event] || currentStatus;
};
