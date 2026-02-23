===============================================================================
                    ETERNITY TOUCH E-COMMERCE PLATFORM
                    Professional Fashion & Beauty Solution
===============================================================================

ABOUT
-----
Eternity Touch is a comprehensive e-commerce platform designed for fashion 
and beauty retailers. Built with modern web technologies, it provides a 
seamless shopping experience for customers and powerful management tools 
for administrators.

This is a commercial product designed for professional use.


KEY FEATURES
------------

Customer Features:
  - Shopping cart and wishlist management
  - Multiple payment methods (Stripe, Razorpay, Cash on Delivery)
  - User account management with profile customization
  - Product reviews and ratings
  - Advanced search and filtering
  - Real-time order tracking
  - Multiple delivery addresses
  - Discount coupons and promotions
  - Email notifications

Admin Features:
  - Comprehensive dashboard with analytics
  - Product management with image upload
  - Dynamic sizing system (Shoes: 19-45, Clothes: XS-XXXL)
  - Order processing and management
  - Customer relationship management
  - Coupon and discount management
  - Return and refund handling
  - Live chat support
  - Loyalty program management
  - Abandoned cart recovery
  - Sales reports and analytics

Technical Features:
  - Two-factor authentication for admin
  - Automated CI/CD pipeline
  - Responsive mobile-first design
  - SEO optimized
  - Real-time updates with WebSocket
  - AI-powered product recommendations
  - Secure payment processing
  - Image optimization and CDN


TECHNOLOGY STACK
----------------

Frontend:
  - React 18
  - React Router
  - Tailwind CSS
  - Axios
  - Vite

Admin Panel:
  - React 18
  - React Bootstrap
  - Material-UI
  - Chart.js
  - Socket.IO Client

Backend:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication
  - Bcrypt encryption
  - Cloudinary for images
  - Nodemailer
  - Socket.IO
  - Stripe & Razorpay integration


SYSTEM REQUIREMENTS
-------------------
  - Node.js v18 or higher
  - npm v9 or higher
  - MongoDB v6 or higher
  - 4GB RAM minimum
  - 10GB disk space


INSTALLATION
------------

1. Extract the project files to your desired location

2. Install Backend Dependencies:
   cd backend
   npm install

3. Install Frontend Dependencies:
   cd frontend
   npm install --legacy-peer-deps

4. Install Admin Dependencies:
   cd admin
   npm install --legacy-peer-deps


CONFIGURATION
-------------

Backend Configuration (backend/.env):

PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
STRIPE_SECRET_KEY=your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

Frontend Configuration (frontend/.env):

VITE_BACKEND_URL=http://localhost:4000

Admin Configuration (admin/.env):

VITE_BACKEND_URL=http://localhost:4000


RUNNING THE APPLICATION
-----------------------

Start Backend:
  cd backend
  npm start
  (Runs on http://localhost:4000)

Start Frontend:
  cd frontend
  npm run dev
  (Runs on http://localhost:5173)

Start Admin Panel:
  cd admin
  npm run dev
  (Runs on http://localhost:5174)


DEFAULT ADMIN ACCESS
--------------------
Email: admin@eternitytouch.com
Password: Admin@123

IMPORTANT: Change these credentials immediately after first login!


PROJECT STRUCTURE
-----------------

backend/
  - config/         Configuration files
  - controllers/    Business logic
  - middleware/     Custom middleware
  - models/         Database schemas
  - routes/         API endpoints
  - services/       Service layer
  - utils/          Helper functions
  - server.js       Application entry point

frontend/
  - src/
    - assets/       Images and styles
    - components/   Reusable components
    - context/      State management
    - pages/        Page components
    - App.jsx       Main application

admin/
  - src/
    - components/   UI components
    - layouts/      Layout templates
    - pages/        Admin pages
    - utils/        Utilities
    - App.jsx       Admin application


DEPLOYMENT
----------

The application is designed to be deployed on:
  - Backend: Any Node.js hosting service
  - Frontend: Static hosting service
  - Admin: Static hosting service
  - Database: MongoDB Atlas or self-hosted

Ensure all environment variables are properly configured in production.


SECURITY NOTES
--------------
  - Never commit .env files to version control
  - Use strong passwords for admin accounts
  - Enable HTTPS in production
  - Regularly update dependencies
  - Configure CORS properly
  - Use environment-specific configurations
  - Enable rate limiting
  - Implement proper input validation


SUPPORT
-------
For technical support and inquiries:
Email: eternity@touch.tn
Phone: +216 51 700 968


COMMERCIAL USE
--------------
This is a commercial product. All rights reserved.
Unauthorized copying, distribution, or modification is prohibited.


===============================================================================
                        Eternity Touch E-commerce
                    Professional Fashion & Beauty Platform
===============================================================================
