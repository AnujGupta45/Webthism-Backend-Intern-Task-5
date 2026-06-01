# Webthism Backend Intern Task 5: E-Commerce API (Part 1)

Welcome! This repository contains the backend implementation for the **E-Commerce API (Part 1)** developed during Week 5 of the Webthism Full Stack/Backend Developer Internship. 

The API is built using **Node.js, Express, TypeScript, SQLite, and Prisma ORM**.

---

## 🛠️ Technology Stack
*   **Language:** TypeScript
*   **Runtime:** Node.js
*   **Web Framework:** Express (v5)
*   **ORM:** Prisma (v7)
*   **Database:** SQLite
*   **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` password hashing

---

## 📊 Database Schema Relationship

Here is the visual diagram illustrating the relations between our models (`User`, `Category`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem`):

![Database Schema](db_schema_diagram.png)

### Relationship Rules
*   **User & Cart**: One-to-one relationship. Every user receives a unique cart automatically upon registration.
*   **User & Orders**: One-to-many relationship. A user can place multiple orders.
*   **Category & Products**: One-to-many relationship. A category contains multiple products.
*   **Cart & CartItems**: One-to-many relationship. A cart can hold multiple items.
*   **Product & CartItems/OrderItems**: One-to-many relationship. A product can be referenced across multiple cart and order items.
*   **Order & OrderItems**: One-to-many relationship. An order contains multiple purchased product items.

---

## 📁 Project Structure

```
├── prisma/
│   ├── migrations/           # Database migration files
│   └── schema.prisma         # Database models & relationships
├── src/
│   ├── config/
│   │   └── db.ts             # Prisma Client config with SQLite adapter
│   ├── controllers/
│   │   ├── authController.ts # Logic for register and login
│   │   └── productController.ts # Logic for products & categories CRUD
│   ├── middlewares/
│   │   ├── authMiddleware.ts # JWT verification & role controls
│   │   └── errorMiddleware.ts # Global error handling pipeline
│   ├── routes/
│   │   ├── authRoutes.ts     # Auth endpoints (/api/auth)
│   │   ├── categoryRoutes.ts # Category endpoints (/api/categories)
│   │   └── productRoutes.ts  # Product endpoints (/api/products)
│   ├── utils/
│   │   └── jwt.ts            # Token generator and verifier helpers
│   ├── app.ts                # Express application setup
│   └── server.ts             # Server entry point
├── .env                      # Connection URLs and secrets
├── db_schema_diagram.png     # Database relationships image
├── package.json              # Script runner & dependencies
├── test-api.ts               # Integration test suite runner
└── tsconfig.json             # TypeScript compiler choices
```

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/AnujGupta45/Webthism-Backend-Intern-Task-5.git
cd Webthism-Backend-Intern-Task-5
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (already pre-configured locally):
```env
DATABASE_URL="file:./dev.db"
PORT=3000
JWT_SECRET="webthism-super-secret-e-commerce-key-2026"
```

### 3. Run Database Migrations
Generate the SQLite database file and tables:
```bash
npm run db:migrate --name init
```

### 4. Run the Development Server
```bash
npm run dev
```
The API server will listen at [http://localhost:3000](http://localhost:3000).

---

## 📡 API Endpoints

### 🔐 Authentication
*   `POST /api/auth/register` - Create user/admin account.
    *   *Payload:* `{ "email": "user@example.com", "password": "password123", "role": "USER" }` (Use `"role": "ADMIN"` for admin features).
*   `POST /api/auth/login` - Authenticate and return JWT token.
    *   *Payload:* `{ "email": "user@example.com", "password": "password123" }`

### 🏷️ Categories
*   `GET /api/categories` - Read all categories (Public).
*   `POST /api/categories` - Create a new category (Admin Auth required).
    *   *Payload:* `{ "name": "Electronics", "description": "Gadgets and tech" }`

### 📦 Products
*   `GET /api/products` - Filter, search, and list products (Public).
    *   *Query options:*
        *   `categoryId`: Filter by category ID.
        *   `search`: Keyword search matching name & description.
        *   `minPrice` / `maxPrice`: Filter by price range.
        *   `sortBy` / `order`: Sort by columns (e.g. `price`, `stock`, `createdAt` asc/desc).
*   `GET /api/products/:id` - Fetch product details (Public).
*   `POST /api/products` - Create product (Admin Auth required).
    *   *Payload:* `{ "name": "Smartphone X", "price": 1099, "stock": 45, "categoryId": "..." }`
*   `PUT /api/products/:id` - Update product details (Admin Auth required).
*   `DELETE /api/products/:id` - Delete product and related records (Admin Auth required).

---

## 🧪 Running Integration Tests

To verify that the database relationships, validation schemas, JWT tokens, and search filters work correctly, execute:
```bash
npx ts-node test-api.ts
```

Output results:
```text
[Test] Starting test server on port 3001...
[Test] Cleaning database tables...
[Test] Running Authentication tests...
[Test] Register User response status: 201
[Test] Register Admin response status: 201
[Test] Login User response status: 200
[Test] Running Category tests...
[Test] Create Category as User status: 403 (Forbidden)
[Test] Create Category as Admin status: 201 (Created)
[Test] Running Product tests...
[Test] Create Product as User status: 403 (Forbidden)
[Test] Create Product as Admin status: 201 (Created)
[Test] Create Second Product status: 201 (Created)
[Test] Running Search and Filter tests...
[Test] Get all products count: 2
[Test] Get products with maxPrice=200 count: 1
[Test] Get products search='Smartphone' count: 1
[Test] Running Product detail, update, and delete tests...
[Test] Get product detail status: 200
[Test] Update product status: 200
[Test] Delete product status: 204
[Test] Verify delete status: 404

==========================================
ALL TESTS COMPLETED SUCCESSFULLY! 🎉
==========================================
[Test] Stopping test server...
```
