/**
 * Get available sizes based on product category and subcategory
 * @param {string} category - Product category
 * @param {string} subCategory - Product subcategory
 * @returns {Array} - Array of available sizes
 */
export const getSizesByCategory = (category, subCategory) => {
    const lowerCategory = category?.toLowerCase() || '';
    const lowerSubCategory = subCategory?.toLowerCase() || '';

    // Chaussures (Shoes, Espadrilles, Sneakers, etc.)
    if (
        lowerSubCategory.includes('shoe') ||
        lowerSubCategory.includes('espadrille') ||
        lowerSubCategory.includes('sneaker') ||
        lowerSubCategory.includes('boot') ||
        lowerSubCategory.includes('sandal') ||
        lowerSubCategory.includes('chaussure')
    ) {
        return {
            enfant: Array.from({ length: 17 }, (_, i) => (19 + i).toString()), // 19-35
            adulte: Array.from({ length: 10 }, (_, i) => (36 + i).toString())  // 36-45
        };
    }

    // Vêtements (Pantalon, Jacket, Shirt, etc.)
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
};

/**
 * Check if category requires shoe sizes
 * @param {string} category - Product category
 * @param {string} subCategory - Product subcategory
 * @returns {boolean}
 */
export const requiresShoeSizes = (category, subCategory) => {
    const lowerSubCategory = subCategory?.toLowerCase() || '';
    
    return (
        lowerSubCategory.includes('shoe') ||
        lowerSubCategory.includes('espadrille') ||
        lowerSubCategory.includes('sneaker') ||
        lowerSubCategory.includes('boot') ||
        lowerSubCategory.includes('sandal') ||
        lowerSubCategory.includes('chaussure')
    );
};
