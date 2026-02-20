import { describe, it, expect } from '@jest/globals';
import {
  validateOrderItems,
  validateCouponCode,
  validateQuantity,
  validatePrice,
  validateDiscount,
  sanitizeString,
  validatePagination
} from '../utils/validators.js';

describe('Validators - Critical Business Logic', () => {
  
  // ✅ TEST 1: Order Items Validation (CRITIQUE - Paiements)
  describe('validateOrderItems', () => {
    it('should reject empty cart', () => {
      const result = validateOrderItems([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject invalid quantity', () => {
      const items = [{ _id: '123', name: 'Product', quantity: -1, price: 100 }];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('quantity');
    });

    it('should reject quantity > 99', () => {
      const items = [{ _id: '123', name: 'Product', quantity: 100, price: 100 }];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('maximum');
    });

    it('should accept valid items', () => {
      const items = [
        { _id: '123', name: 'Product', quantity: 2, price: 100 },
        { _id: '456', name: 'Product 2', quantity: 1, price: 50 }
      ];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject negative price', () => {
      const items = [{ _id: '123', name: 'Product', quantity: 1, price: -10 }];
      const result = validateOrderItems(items);
      expect(result.isValid).toBe(false);
    });
  });

  // ✅ TEST 2: Coupon Validation (CRITIQUE - Réductions)
  describe('validateCouponCode', () => {
    it('should reject empty code', () => {
      const result = validateCouponCode('');
      expect(result.isValid).toBe(false);
    });

    it('should reject code too short', () => {
      const result = validateCouponCode('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('3 and 20');
    });

    it('should reject code too long', () => {
      const result = validateCouponCode('A'.repeat(21));
      expect(result.isValid).toBe(false);
    });

    it('should reject invalid characters', () => {
      const result = validateCouponCode('CODE@123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('letters, numbers, and hyphens');
    });

    it('should accept valid code and sanitize', () => {
      const result = validateCouponCode('summer-2024');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('SUMMER-2024');
    });
  });

  // ✅ TEST 3: Quantity Validation (CRITIQUE - Stock)
  describe('validateQuantity', () => {
    it('should reject non-integer', () => {
      const result = validateQuantity(1.5);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('integer');
    });

    it('should reject negative', () => {
      const result = validateQuantity(-1);
      expect(result.isValid).toBe(false);
    });

    it('should reject above max', () => {
      const result = validateQuantity(100, 0, 99);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid quantity', () => {
      const result = validateQuantity(5);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(5);
    });
  });

  // ✅ TEST 4: Price Validation (CRITIQUE - Paiements)
  describe('validatePrice', () => {
    it('should reject negative price', () => {
      const result = validatePrice(-10);
      expect(result.isValid).toBe(false);
    });

    it('should reject price above max', () => {
      const result = validatePrice(2000000);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid price', () => {
      const result = validatePrice(99.99);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(99.99);
    });

    it('should accept zero price', () => {
      const result = validatePrice(0);
      expect(result.isValid).toBe(true);
    });
  });

  // ✅ TEST 5: Discount Validation (CRITIQUE - Réductions)
  describe('validateDiscount', () => {
    it('should reject percentage > 100', () => {
      const result = validateDiscount('percentage', 101);
      expect(result.isValid).toBe(false);
    });

    it('should reject negative discount', () => {
      const result = validateDiscount('percentage', -10);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid percentage', () => {
      const result = validateDiscount('percentage', 15);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(15);
    });

    it('should reject fixed discount > 10000', () => {
      const result = validateDiscount('fixed', 15000);
      expect(result.isValid).toBe(false);
    });

    it('should accept valid fixed discount', () => {
      const result = validateDiscount('fixed', 50);
      expect(result.isValid).toBe(true);
    });
  });

  // ✅ TEST 6: String Sanitization (SÉCURITÉ - XSS)
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  hello  ');
      expect(result).toBe('hello');
    });

    it('should limit length', () => {
      const result = sanitizeString('a'.repeat(2000), 100);
      expect(result.length).toBe(100);
    });
  });

  // ✅ TEST 7: Pagination Validation
  describe('validatePagination', () => {
    it('should default to page 1', () => {
      const result = validatePagination(null, 20);
      expect(result.page).toBe(1);
    });

    it('should limit max items per page', () => {
      const result = validatePagination(1, 200);
      expect(result.limit).toBeLessThanOrEqual(100);
    });

    it('should reject negative page', () => {
      const result = validatePagination(-1, 20);
      expect(result.page).toBe(1);
    });
  });
});
