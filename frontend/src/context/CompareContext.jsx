import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const CompareContext = createContext();

const CompareContextProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState([]);
    const maxCompareItems = 4;

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('compareItems');
        if (saved) {
            try {
                setCompareItems(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading compare items:', error);
            }
        }
    }, []);

    // Save to localStorage whenever compareItems changes
    useEffect(() => {
        localStorage.setItem('compareItems', JSON.stringify(compareItems));
    }, [compareItems]);

    // Add product to compare
    const addToCompare = (product) => {
        if (compareItems.length >= maxCompareItems) {
            toast.warning(`You can only compare up to ${maxCompareItems} products`);
            return false;
        }

        // Check if already in compare
        if (compareItems.find(item => item._id === product._id)) {
            toast.info('Product already in comparison');
            return false;
        }

        setCompareItems([...compareItems, product]);
        toast.success('Added to comparison');
        return true;
    };

    // Remove product from compare
    const removeFromCompare = (productId) => {
        setCompareItems(compareItems.filter(item => item._id !== productId));
        toast.success('Removed from comparison');
    };

    // Clear all compare items
    const clearCompare = () => {
        setCompareItems([]);
        toast.success('Comparison cleared');
    };

    // Check if product is in compare
    const isInCompare = (productId) => {
        return compareItems.some(item => item._id === productId);
    };

    const value = {
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        maxCompareItems
    };

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
};

export default CompareContextProvider;
