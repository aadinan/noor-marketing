# File & Project Structure

This document outlines the file and directory structure of the Noor Marketing workspace, which consists of a Node.js backend, a Vite/React frontend, and a Flutter mobile app (`inventory_mobile`).

## Root Directory

```text
noor-marketing/
├── backend/          # Node.js + Express backend service
├── docs/             # Technical documentation
├── frontend/         # React (Vite) web dashboard application
├── inventory_mobile/ # Flutter mobile application
└── README.md         # Developer onboarding guide
```

## Backend (`/backend`)
The backend is a Node.js API built with Express and MongoDB.

```text
backend/
├── config/           # Configuration files (e.g., database connection)
├── controllers/      # Route handlers/business logic (e.g., userController.js)
├── middleware/       # Express middlewares (authMiddleware.js, errorHandler.js)
├── models/           # Mongoose schemas and data models (User, Product, Order)
├── routes/           # Express API route definitions
├── services/         # Complex business logic and background services (e.g., creditEngine.js)
├── utils/            # Helper utilities and shared functions
├── server.js         # Entry point for the Node.js application
└── seed.js           # Database seeding script for development
```

## Frontend (`/frontend`)
The frontend is a single-page application (SPA) built using React, Vite, and Tailwind CSS.

```text
frontend/
├── public/           # Static assets
├── src/
│   ├── api/          # Axios configuration and API clients
│   ├── assets/       # Images, icons, and local assets
│   ├── components/   # Reusable UI components (Modals, Cards, Navbars)
│   ├── pages/        # Top-level route components (Dashboards, Forms, Lists)
│   ├── store/        # State management (e.g., Zustand authStore.js)
│   ├── utils/        # Shared helper functions (e.g., receiptHelper.js)
│   ├── App.jsx       # Root component and router configuration
│   └── index.css     # Global styles and Tailwind configuration
├── index.html        # HTML entry point
├── tailwind.config.js# Tailwind CSS configuration
└── vite.config.js    # Vite bundler configuration
```

## Mobile App (`/inventory_mobile`)
The mobile application is built using Flutter for cross-platform deployment.

```text
inventory_mobile/
├── android/          # Android-specific build configuration
├── ios/              # iOS-specific build configuration
├── lib/
│   ├── models/       # Dart data models (e.g., retailer.dart)
│   ├── screens/      # UI screens (e.g., dashboard_screen.dart, barcode_scanner_screen.dart)
│   ├── services/     # API integration, offline sync, and local DB (SQLite) helpers
│   └── main.dart     # Flutter app entry point
├── pubspec.yaml      # Dart dependencies and project metadata
└── analysis_options.yaml # Linting and code analysis rules
```
