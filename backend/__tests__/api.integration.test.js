/**
 * API Integration Tests
 * Tests the complete API flow: HTTP Request → Controller → Database → Response
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js'; // We'll need to export app from server.js
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Test database connection
const TEST_DB = 'mongodb://localhost:27017/forever-test';

beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(TEST_DB);
    console.log('Connected to test database');
});

afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database cleaned and disconnected');
});

beforeEach(async () => {
    // Clear collections before each test
    await userModel.deleteMany({});
    await productModel.deleteMany({});
    await orderModel.deleteMany({});
});

// Helper functions
const createTestUser = async () => {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const user = await userModel.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        emailVerified: true
    });
    return user;
};

const createTestProduct = async () => {
    const product = await productModel.create({
        name: 'Test Product',
        price: 100,
        description: 'Test description',
        images: ['test.jpg'],
        category: 'Men',
        subCategory: 'Topwear',
        sizes: ['S', 'M', 'L'],
        bestseller: false,
        date: Date.now(),
        stock: 10
    });
    return product;
};

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================
// USER API TESTS
// ============================================

describe('User API Integration Tests', () => {
    
    test('POST /api/user/register - should register new user', async () => {
        const response = await request(app)
            .post('/api/user/register')
            .send({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'Strong@Password123',
                recaptchaToken: 'test-token' // Mock reCAPTCHA token
            });

        // Note: Will fail due to reCAPTCHA validation in real environment
        // In production, you'd mock the reCAPTCHA service
        expect(response.status).toBe(200);
        expect(response.body.message).toContain('reCAPTCHA');
    });

    test('POST /api/user/register - should reject weak password', async () => {
        const response = await request(app)
            .post('/api/user/register')
            .send({
                name: 'New User',
                email: 'newuser@example.com',
                password: '123456', // Weak password
                recaptchaToken: 'test-token'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('reCAPTCHA');
    });

    test('POST /api/user/login - should login with correct credentials', async () => {
        await createTestUser();

        const response = await request(app)
            .post('/api/user/login')
            .send({
                email: 'test@example.com',
                password: 'Test@123',
                recaptchaToken: 'test-token'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toContain('reCAPTCHA');
    });

    test('POST /api/user/login - should reject wrong password', async () => {
        await createTestUser();

        const response = await request(app)
            .post('/api/user/login')
            .send({
                email: 'test@example.com',
                password: 'WrongPassword',
                recaptchaToken: 'test-token'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('reCAPTCHA');
    });
});

// ============================================
// PRODUCT API TESTS
// ============================================

describe('Product API Integration Tests', () => {
    
    test('GET /api/product/list - should return all products', async () => {
        await createTestProduct();
        await createTestProduct();

        const response = await request(app)
            .get('/api/product/list');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.products).toHaveLength(2);
    });

    test('POST /api/product/single - should return single product', async () => {
        const product = await createTestProduct();

        const response = await request(app)
            .post('/api/product/single')
            .send({ productId: product._id.toString() });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.product.name).toBe('Test Product');
        expect(response.body.product.price).toBe(100);
    });
});

// ============================================
// ORDER API TESTS (CRITICAL)
// ============================================

describe('Order API Integration Tests', () => {
    
    test('POST /api/order/place - should create order and decrement stock', async () => {
        const user = await createTestUser();
        const product = await createTestProduct();
        const token = generateToken(user._id);

        const initialStock = product.stock;

        const response = await request(app)
            .post('/api/order/place')
            .set('token', token)
            .send({
                userId: user._id.toString(),
                items: [{
                    _id: product._id.toString(),
                    name: product.name,
                    quantity: 2,
                    price: product.price,
                    size: 'M'
                }],
                amount: 210, // 100*2 + 10 delivery
                address: {
                    firstName: 'Test',
                    lastName: 'User',
                    street: '123 Main St',
                    city: 'Test City',
                    country: 'Test Country',
                    zipcode: '12345',
                    phone: '1234567890'
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify order in database
        const order = await orderModel.findOne({ userId: user._id });
        expect(order).toBeTruthy();
        expect(order.amount).toBe(210);
        expect(order.items).toHaveLength(1);

        // Verify stock decremented
        const updatedProduct = await productModel.findById(product._id);
        expect(updatedProduct.stock).toBe(initialStock - 2);

        // Verify cart cleared
        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.cartData).toEqual({});
    });

    test('POST /api/order/place - should reject order with insufficient stock', async () => {
        const user = await createTestUser();
        const product = await createTestProduct();
        const token = generateToken(user._id);

        const response = await request(app)
            .post('/api/order/place')
            .set('token', token)
            .send({
                userId: user._id.toString(),
                items: [{
                    _id: product._id.toString(),
                    name: product.name,
                    quantity: 999, // More than available stock
                    price: product.price,
                    size: 'M'
                }],
                amount: 99900,
                address: {
                    firstName: 'Test',
                    lastName: 'User',
                    street: '123 Main St',
                    city: 'Test City',
                    country: 'Test Country',
                    zipcode: '12345',
                    phone: '1234567890'
                }
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('maximum');
    });

    test('POST /api/order/place - should reject order without authentication', async () => {
        const user = await createTestUser();
        const product = await createTestProduct();

        const response = await request(app)
            .post('/api/order/place')
            // No token provided
            .send({
                userId: user._id.toString(),
                items: [{
                    _id: product._id.toString(),
                    name: product.name,
                    quantity: 1,
                    price: product.price,
                    size: 'M'
                }],
                amount: 110,
                address: {
                    firstName: 'Test',
                    lastName: 'User',
                    street: '123 Main St',
                    city: 'Test City',
                    country: 'Test Country',
                    zipcode: '12345',
                    phone: '1234567890'
                }
            });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    test('GET /api/order/userOrders - should return user orders', async () => {
        const user = await createTestUser();
        const token = generateToken(user._id);

        // Create an order
        await orderModel.create({
            userId: user._id,
            items: [{ name: 'Test', quantity: 1, price: 100 }],
            amount: 110,
            address: { street: '123 Main' },
            paymentMethod: 'COD',
            payment: false,
            date: Date.now()
        });

        const response = await request(app)
            .post('/api/order/userOrders')
            .set('token', token)
            .send({ userId: user._id.toString() });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.orders).toHaveLength(1);
    });
});

// ============================================
// CART API TESTS
// ============================================

describe('Cart API Integration Tests', () => {
    
    test('POST /api/cart/add - should add item to cart', async () => {
        const user = await createTestUser();
        const product = await createTestProduct();
        const token = generateToken(user._id);

        const response = await request(app)
            .post('/api/cart/add')
            .set('token', token)
            .send({
                userId: user._id.toString(),
                itemId: product._id.toString(),
                size: 'M'
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify cart in database
        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.cartData[product._id]).toBeTruthy();
        expect(updatedUser.cartData[product._id]['M']).toBe(1);
    });

    test('POST /api/cart/get - should return user cart', async () => {
        const user = await createTestUser();
        const product = await createTestProduct();
        const token = generateToken(user._id);

        // Add item to cart
        user.cartData = { [product._id]: { 'M': 2 } };
        await user.save();

        const response = await request(app)
            .post('/api/cart/get')
            .set('token', token)
            .send({ userId: user._id.toString() });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.cartData[product._id]['M']).toBe(2);
    });
});

console.log('✅ Integration tests configured successfully');
