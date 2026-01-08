# E-Commerce Shopping Cart Application

A full-stack e-commerce application built with React, Express, Prisma, and PostgreSQL. This project demonstrates modern web development practices including JWT authentication, RESTful API design, and database management.

## Features

### User Features
- **User Authentication**: Secure registration and login system using JWT tokens
- **Product Browsing**: View all available products with search functionality
- **Shopping Cart**: Add items to cart, update quantities, and remove items
- **Cart Management**: View cart totals and item counts in real-time

### Admin Features
- **Product Management**: Create, update, and delete products
- **Admin Dashboard**: Dedicated admin routes with role-based access control

## Tech Stack

### Frontend
- **React**: Component-based UI with hooks
- **Context API**: Global state management for authentication
- **CSS-in-JS**: Inline styling for component design

### Backend
- **Express.js**: RESTful API server
- **Prisma ORM**: Type-safe database operations
- **PostgreSQL**: Relational database
- **JWT**: Secure token-based authentication
- **bcryptjs**: Password hashing

### DevOps
- **Docker**: Containerization of all services
- **Docker Compose**: Multi-container orchestration
- **PostgreSQL**: Lightweight database image

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server setup
│   │   ├── prismaClient.js        # Prisma client configuration
│   │   ├── routes/
│   │   │   ├── authRoutes.js      # Authentication endpoints
│   │   │   ├── shoppingRoutes.js  # Product and cart endpoints
│   │   │   └── adminRoutes.js     # Admin product management
│   │   └── middleware/
│   │       ├── authMiddleware.js  # JWT verification
│   │       └── adminMiddleware.js # Admin role verification
│   ├── Dockerfile                 # Backend container configuration
│   └── package.json
├── frontend/
│   ├── App.jsx                    # React frontend application
│   ├── Dockerfile                 # Frontend container configuration
│   └── package.json
└── docker-compose.yaml            # Multi-container orchestration
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token

### Shopping
- `GET /shopping/products` - Get all products (supports search query)
- `GET /shopping/cart` - Get current user's cart
- `POST /shopping/cart/add` - Add item to cart
- `DELETE /shopping/cart/item/:id` - Remove item from cart
- `DELETE /shopping/cart` - Clear entire cart
- `POST /shopping/checkout` - Create Stripe checkout session

### Admin (Protected)
- `GET /admin/products` - Get all products (admin view)
- `POST /admin/products` - Create new product
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product

## Installation

The easiest way to run this project is using Docker Compose, which sets up the entire stack automatically.

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

This will start three containers:
- **PostgreSQL Database** on `localhost:5432`
- **Backend API** on `localhost:5003`
- **React Frontend** on `localhost:3000`

3. **Set up the database schema**
   ```bash
   docker-compose exec backend npx prisma migrate dev
   docker-compose exec backend npx prisma generate
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5003`

5. **Stop the services**
   ```bash
   docker-compose down
