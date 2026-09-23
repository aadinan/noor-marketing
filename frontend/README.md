# ERP Frontend Web Dashboard

The frontend web application is a responsive admin dashboard built with React (Vite) and styled with Tailwind CSS.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. By default, the frontend relies on the backend running at `http://localhost:5000/api`. To configure an alternative API URL, create a `.env` file in the `/frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

## Development

Start the development server:
```bash
npm run dev
```
The application will be served at `http://localhost:5173`.

## Production Build

To build the application for production deployment:
```bash
npm run build
```
This generates optimized static files in the `/dist` directory.
