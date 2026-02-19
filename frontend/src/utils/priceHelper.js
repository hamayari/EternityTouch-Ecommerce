/**
 * Calculate discounted price and check if discount is active
 */

export const getDiscountedPrice = (product) => {
  if (!product.discount || product.discount === 0) {
    return {
      hasDiscount: false,
      originalPrice: product.price,
      finalPrice: product.price,
      discountPercentage: 0
    };
  }

  // Check if discount has expired
  if (product.discountEndDate) {
    const endDate = new Date(product.discountEndDate);
    const now = new Date();
    if (now > endDate) {
      return {
        hasDiscount: false,
        originalPrice: product.price,
        finalPrice: product.price,
        discountPercentage: 0,
        expired: true
      };
    }
  }

  const discountAmount = (product.price * product.discount) / 100;
  const finalPrice = product.price - discountAmount;

  return {
    hasDiscount: true,
    originalPrice: product.price,
    finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimals
    discountPercentage: product.discount,
    discountEndDate: product.discountEndDate
  };
};

export const getTimeRemaining = (endDate) => {
  if (!endDate) return null;

  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total: diff };
};
