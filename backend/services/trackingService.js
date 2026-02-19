import pkg from 'aftership';
const { Aftership } = pkg;

// Initialize AfterShip (will be null if API key not configured)
let aftership = null;

try {
  if (process.env.AFTERSHIP_API_KEY && process.env.AFTERSHIP_API_KEY !== 'your_aftership_api_key_here') {
    aftership = new Aftership(process.env.AFTERSHIP_API_KEY);
    console.log('✅ AfterShip tracking service initialized');
  }
} catch (error) {
  console.log('⚠️  AfterShip initialization failed');
}

/**
 * Retry helper with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            const waitTime = delay * Math.pow(2, attempt - 1);
            console.log(`[TRACKING] Retry attempt ${attempt}/${maxRetries} after ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Créer un tracking
export const createTracking = async (trackingNumber, courier) => {
  if (!aftership) {
    throw new Error('AfterShip not configured');
  }
  
  try {
    // ✅ Retry up to 3 times
    const result = await retryWithBackoff(async () => {
      return await aftership.tracking.create({
        tracking_number: trackingNumber,
        slug: courier,
      });
    }, 3, 1000);
    
    return result.data.tracking;
  } catch (error) {
    console.error('[TRACKING] Error creating tracking after retries:', error);
    throw error;
  }
};

// Récupérer l'état du tracking
export const getTracking = async (trackingNumber, courier) => {
  if (!aftership) {
    throw new Error('AfterShip not configured');
  }
  
  try {
    // ✅ Retry up to 3 times
    const result = await retryWithBackoff(async () => {
      return await aftership.tracking.get(courier, trackingNumber);
    }, 3, 1000);
    
    return result.data.tracking;
  } catch (error) {
    console.error('[TRACKING] Error getting tracking after retries:', error);
    throw error;
  }
};

// Obtenir tous les checkpoints (historique)
export const getTrackingCheckpoints = async (trackingNumber, courier) => {
  try {
    const tracking = await getTracking(trackingNumber, courier);
    return tracking.checkpoints || []; // Tous les points de passage
  } catch (error) {
    console.error('Error getting checkpoints:', error);
    return [];
  }
};

// Vérifier si AfterShip est configuré
export const isTrackingEnabled = () => {
  return aftership !== null;
};
