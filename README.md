# Noor Marketing ERP System

Welcome to the Noor Marketing ERP System. This monorepo-style project contains three main applications that work together: a Node.js backend, a React frontend web application, and a Flutter mobile application.

## 📚 Technical Documentation

For in-depth architectural and API details, refer to the `docs/` folder:
- [Project & File Structure](./docs/file-structure.md)
- [Technical Deep-Dive & Architecture](./docs/technical-spec.md)
- [API Specification](./docs/api-docs.md)
- [Database Schema](./docs/database-schema.md)

## 🛠️ Prerequisites

Before starting, ensure you have the following installed on your machine:
- Node.js (v18+)
- npm (Node Package Manager)
- Flutter SDK (v3.8+)
- MongoDB (Local or Atlas Cluster)

---

## 🚀 Developer Onboarding Guide

Follow these steps to get the full stack running on your local machine.

### 1. Backend Setup (Node.js/Express)
The backend is the core API serving data to both the frontend and mobile apps.

**Terminal 1:**
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create the environment variables file
# Create a `.env` file in the backend folder and add:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/noormarketing (or your Atlas URI)
# JWT_SECRET=your_super_secret_jwt_key

# Start the development server
npm run dev
# Expected output: 🚀 Server running on port 5000
```

### 2. Frontend Setup (React/Vite)
The frontend is the web dashboard for administration and management.

**Terminal 2:**
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
# Expected output: Vite server running on http://localhost:5173
```

### 3. Mobile App Setup (Flutter)
The mobile app is for field salesmen and warehouse staff.

**Terminal 3:**
```bash
# Navigate to the mobile app directory
cd inventory_mobile

# Get Flutter dependencies
flutter pub get

# Run on an attached device or emulator
flutter run
```

---

## System Architecture Overview

- **Backend (`/backend`)**: A Node.js and Express RESTful API powering business logic and data persistence (MongoDB).
- **Frontend (`/frontend`)**: A modern React web dashboard built with Vite for administration and management.
- **Mobile (`/inventory_mobile`)**: A Flutter cross-platform mobile application interface for field operations and inventory management.
