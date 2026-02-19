# Testing Guide

## Overview

The backend has comprehensive test coverage with both unit tests and integration tests.

## Test Statistics

- **Total Tests**: 81
- **Unit Tests**: 69 (critical business logic)
- **Integration Tests**: 12 (API endpoints)
- **Coverage**: Critical paths covered

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:critical
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Types

### Unit Tests
Test individual functions and business logic in isolation:
- `coupon.critical.test.js` - Coupon calculation logic
- `order.critical.test.js` - Order processing and stock management
- `validators.test.js` - Input validation functions
- `product.test.js` - Product validation

### Integration Tests
Test complete API flows from HTTP request to database:
- `api.integration.test.js` - User, Product, Order, Cart APIs

## Integration Test Coverage

### User API
- ✅ User registration (with reCAPTCHA validation)
- ✅ Login authentication
- ✅ Password validation

### Product API
- ✅ List all products
- ✅ Get single product details

### Order API (Critical)
- ✅ Place order with stock decrement
- ✅ Reject orders with insufficient stock
- ✅ Authentication required
- ✅ Retrieve user orders

### Cart API
- ✅ Add items to cart
- ✅ Retrieve user cart

## Test Database

Integration tests use a separate test database:
- **Database**: `mongodb://localhost:27017/forever-test`
- **Auto-cleanup**: Database is dropped after each test run
- **Isolation**: Each test starts with a clean database

## Important Notes

1. **MongoDB Required**: Integration tests require MongoDB running locally
2. **Environment**: Tests run with `NODE_ENV=test`
3. **No Server Start**: Server doesn't start in test mode (only app is exported)
4. **reCAPTCHA**: Tests expect reCAPTCHA validation (mocked in tests)
5. **Email**: Email service errors are expected in tests (no SMTP configured)

## Adding New Tests

### Unit Test Example
```javascript
import { describe, test, expect } from '@jest/globals';

describe('Feature Name', () => {
    test('should do something', () => {
        const result = myFunction(input);
        expect(result).toBe(expected);
    });
});
```

### Integration Test Example
```javascript
test('POST /api/endpoint - should work', async () => {
    const response = await request(app)
        .post('/api/endpoint')
        .send({ data: 'value' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});
```

## Test Selection Criteria

Integration tests focus on:
1. **Business Impact**: Features that affect revenue/orders
2. **Complexity**: Multi-step processes (order → stock → cart)
3. **Frequency**: Most-used endpoints
4. **Risk**: Areas prone to bugs (stock management, payments)

## Continuous Integration

Tests should be run:
- Before every commit
- In CI/CD pipeline
- Before deployment to production

## Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
mongod
```

### Tests Hanging
- Check if MongoDB is running
- Ensure no other process is using the test database

### Port Already in Use
- Tests don't start a server, so this shouldn't happen
- If it does, check for running backend processes

## Performance

- Unit tests: ~1-2 seconds
- Integration tests: ~6-8 seconds
- Total test suite: ~8-10 seconds

Fast enough for TDD (Test-Driven Development) workflow.
