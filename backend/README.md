# ERP Backend Services

The backend system is built with Node.js, Express, and MongoDB. It provides RESTful APIs for the web dashboard and mobile application.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or remote)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root of the `/backend` directory.
2. Configure the following environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

## Running the Server

Start the server in development mode (using Nodemon for auto-reload):
```bash
npm run dev
```

Start the server in production mode:
```bash
npm start
```

By default, the server will run on `http://localhost:5000`.

## API Documentation

For full API payload definitions, refer to the [API Documentation](../docs/API_DOCUMENTATION.md).
