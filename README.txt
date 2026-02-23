# 🛍️ Eternity Touch E-commerce Platform

> A modern, full-stack e-commerce solution for fashion and beauty products, built with the MERN stack.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

**Eternity Touch** is a comprehensive e-commerce platform designed for fashion and beauty retailers. Built with modern web technologies, it provides a seamless shopping experience for customers and powerful management tools for administrators.

### 🌟 Why Eternity Touch?

- **Customer-Centric**: Intuitive interface with French localization for the Tunisian market
- **Feature-Rich**: Complete e-commerce functionality from browsing to checkout
- **Scalable**: Built with modern architecture to handle growth
- **Secure**: Industry-standard security practices and payment integration
- **Mobile-First**: Responsive design that works on all devices

### 🎨 Perfect For

- Fashion boutiques
- Beauty product retailers
- Online clothing stores
- Multi-category e-commerce businesses

## ✨ Features

### Customer Features
- 🛒 **Shopping Cart**: Add, remove, and manage products
- 💳 **Multiple Payment Methods**: Stripe, Razorpay, Cash on Delivery
- 👤 **User Accounts**: Registration, login, profile management
- ⭐ **Product Reviews**: Rate and review products
- 🔍 **Advanced Search**: Filter by category, price, size
- 📦 **Order Tracking**: Real-time order status updates
- 💝 **Wishlist**: Save favorite products
- 🎁 **Coupons & Discounts**: Apply promotional codes
- 📍 **Multiple Addresses**: Save and manage delivery addresses
- 🔔 **Email Notifications**: Order confirmations and updates

### Admin Features
- 📊 **Dashboard**: Real-time analytics and insights
- 📦 **Product Management**: Add, edit, delete products with images
- 🏷️ **Dynamic Sizing**: Automatic size selection (shoes: 19-45, clothes: XS-XXXL)
- 📋 **Order Management**: Process and track orders
- 👥 **Customer Management**: View and manage customer data
- 💰 **Coupon Management**: Create and manage discount codes
- 🔄 **Return Management**: Handle product returns
- 💬 **Live Chat**: Real-time customer support
- 🎯 **Loyalty Program**: Reward repeat customers
- 📧 **Abandoned Cart Recovery**: Automated email campaigns
- 📈 **Analytics**: Sales reports and performance metrics

### Technical Features
- 🔐 **Two-Factor Authentication**: Enhanced security for admin
- 🚀 **CI/CD Pipeline**: Automated testing and deployment
- 📱 **Responsive Design**: Works on all devices
- 🌐 **SEO Optimized**: Better search engine visibility
- ⚡ **Performance**: Fast loading times and optimized images
- 🔄 **Real-time Updates**: Socket.IO for live features
- 🤖 **AI Recommendations**: Smart product suggestions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Admin Panel
- **React 18** - UI library
- **React Bootstrap** - UI components
- **Material-UI** - Advanced components
- **Chart.js** - Data visualization
- **Socket.IO Client** - Real-time features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Socket.IO** - Real-time communication
- **Stripe & Razorpay** - Payment processing

### DevOps
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend & Admin hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Check Your Installation

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
git --version
```

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hamayari/EternityTouch-Ecommerce.git
cd EternityTouch-Ecommerce
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install --legacy-peer-deps
```

### 4. Install Admin Dependencies

```bash
cd ../admin
npm install --legacy-peer-deps
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eternity-touch
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eternity-touch

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Admin Credentials
ADMIN_EMAIL=admin@eternitytouch.com
ADMIN_PASSWORD=Admin@123

# Cloudinary (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Service (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# CORS
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# AI (Optional)
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin Configuration

Create a `.env` file in the `admin` directory:

```env
VITE_BACKEND_URL=http://localhost:4000
```

## 🏃 Running the Project

### Option 1: Run All Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 3 - Admin:**
```bash
cd admin
npm run dev
# Admin runs on http://localhost:5174
```

### Option 2: Run with Nodemon (Development)

**Backend with auto-reload:**
```bash
cd backend
npm run server
```

### Access the Application

- **Frontend (Customer)**: http://localhost:5173
- **Admin Panel**: http://localhost:5174
- **Backend API**: http://localhost:4000

### Default Admin Credentials

```
Email: admin@eternitytouch.com
Password: Admin@123
```

⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
eternity-touch-ecommerce/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
│
├── frontend/               # Customer-facing app
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images, styles
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── vite.config.js     # Vite configuration
│
├── admin/                  # Admin panel
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── vite.config.js     # Vite configuration
│
├── .github/               # GitHub Actions workflows
├── BRANCHING_STRATEGY.md  # Git workflow guide
└── README.md              # This file
```

## 🚢 Deployment

### Backend (Render)

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables from `.env`

### Frontend & Admin (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import GitHub repository
3. Create two projects:
   - **Frontend**: Root Directory = `frontend`
   - **Admin**: Root Directory = `admin`
4. Add environment variables
5. Deploy

### Database (MongoDB Atlas)

1. Create account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

## 🤝 Contributing

We welcome contributions! Please see our [Branching Strategy](BRANCHING_STRATEGY.md) for workflow guidelines.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Eternity Touch**
- Email: eternity@touch.tn
- Phone: +216 51 700 968
- Location: Tunisia

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Vercel & Render for hosting services
- All contributors and supporters

---

Made with ❤️ by the Eternity Touch team
