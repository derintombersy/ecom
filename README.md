# Amazon Clone Ecommerce Website

A full-stack ecommerce platform built with Next.js, Express.js, MongoDB, and Razorpay payment integration.

## Tech Stack

- **Frontend**: Next.js 14+ with TypeScript, React, Tailwind CSS
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Payment**: Cashfree (UPI, cards, netbanking)
- **File Upload**: Multer for product images

## Project Structure

```
ecommerce-amazon-clone/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # Reusable components
│   ├── lib/          # Utilities, API clients
│   └── types/        # TypeScript types
├── backend/          # Express API server
│   ├── routes/       # API route handlers
│   ├── models/       # MongoDB models
│   ├── middleware/   # Auth, validation
│   └── controllers/  # Business logic
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and Cashfree credentials (`CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV`)

5. Run the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (copy from `.env.local.example`):
```bash
cp .env.local.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## Features

- User authentication (register/login)
- Product catalog with search and filters
- Shopping cart functionality
- Checkout with Cashfree payment integration
- Product reviews and ratings
- User dashboard with order history
- Admin panel for product and order management

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/products` - Product CRUD operations
- `/api/categories` - Category management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order management
- `/api/reviews` - Product reviews
- `/api/users` - User profile management

