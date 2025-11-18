# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Cashfree account (for payment integration)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret
CASHFREE_ENV=sandbox
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
mongod
```

5. Run the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CASHFREE_APP_ID=your-cashfree-app-id
```

4. Run the frontend development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:3000`

## Creating an Admin User

To create an admin user, you can either:

1. Use MongoDB directly to update a user's role:
```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or modify the registration to allow admin creation (for development only)

## Cashfree Setup

1. Sign up at https://merchant.cashfree.com and switch to the Test environment
2. Generate Sandbox API keys (App ID and Secret Key)
3. Add them to both backend `.env` and frontend `.env.local`
4. For production, switch to live keys and set `CASHFREE_ENV=production`

## Features Implemented

✅ User authentication (register/login)
✅ Product catalog with search and filters
✅ Shopping cart functionality
✅ Checkout with Cashfree payment integration
✅ Product reviews and ratings
✅ User dashboard with order history
✅ Admin panel for product and order management
✅ Responsive design with Tailwind CSS

## Testing the Application

1. Register a new user account
2. Browse products and add items to cart
3. Complete checkout with a test payment
4. View orders in the dashboard
5. As admin, manage products and orders

## Notes

- Make sure MongoDB is running before starting the backend
- Image uploads are stored in `backend/uploads/` directory
- For production, configure proper CORS settings and use environment variables
- Replace placeholder images with actual product images

