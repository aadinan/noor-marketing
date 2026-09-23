# Technical Specification & Architecture

This document provides a technical deep-dive into the architectural decisions, state management, and workflows of the Noor Marketing ecosystem.

## 1. System Architecture Overview
The platform uses a standard Client-Server architecture:
- **Backend:** Node.js / Express API serving JSON data, backed by MongoDB.
- **Frontend Web:** React SPA (Single Page Application) built with Vite for web dashboards.
- **Mobile App:** Flutter mobile application for field sales and logistics personnel.

## 2. Frontend (React / Vite)

### State Management
- **Zustand:** Used for global state management (e.g., `authStore.js`). Zustand's `persist` middleware is utilized to persist the authentication state (JWT tokens, user details) to `localStorage`.
- **Local State:** Component-level state (`useState`, `useReducer`) is used for local forms and UI toggles.

### Routing & Navigation
- **React Router (`react-router-dom`):** Handles client-side routing.
- **Protected Routes:** A custom `<ProtectedRoute>` component wraps restricted pages. It checks the `isAuthenticated` flag from `authStore` and redirects unauthenticated users to the `/login` page. Role-based access control is also implemented to restrict users to their respective dashboards (e.g., Boss vs. Salesman).

### Global Component Patterns
- **"Quick Add" Modals:** Reusable components like `<AddProductModal>` and `<AddShopModal>` are used across different pages to allow users to create records without leaving their current workflow.
- **Manager PIN Modal:** A specific security component (`<ManagerPINModal>`) is used for sensitive actions (like approving discounts or overriding credit limits) requiring elevated privileges on the spot.

### Data Fetching
- **Axios:** A pre-configured Axios instance (`src/api/axios.js`) automatically attaches the JWT from the `authStore` to the `Authorization` header of all outgoing requests.
- **Loading & Error States:** Components utilize standard `isLoading` states, often displaying a `<LoadingSpinner>`, and error handling through `react-toastify` for user feedback.

## 3. Mobile App (Flutter)

### State Management
- **Provider:** The `provider` package is used for managing application state across screens.
- **Local Persistence:** 
  - `flutter_secure_storage` is used for securely storing JWT tokens.
  - `sqflite` is used to maintain a local SQLite database.

### Technical Workflows
- **Offline Sync (Local First):** Because field salesmen might have poor internet connectivity, the app utilizes an offline-first approach for critical data entry (like Collections). 
  - Data is saved to the local `sqflite` database.
  - A background `OfflineSyncService` attempts to synchronize this data with the backend API when internet connectivity is restored.
- **Barcode Scanning:** Integrates the `mobile_scanner` package to quickly scan inventory barcodes during order creation or warehouse stock counts.

## 4. Backend (Node.js / Express)

### Environment Setup
The backend relies on environment variables defined in `.env`:
- `PORT` - The port for the server to listen on.
- `MONGO_URI` - Connection string for MongoDB.
- `JWT_SECRET` - Secret key used for signing JWT tokens.

### Background Jobs & Services
- **Credit Engine (`creditEngine.js`):** A scheduled utility that runs in the background to automatically recalculate and evaluate credit metrics for Retailers based on their payment history.
