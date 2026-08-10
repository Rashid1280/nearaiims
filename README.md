# NearAIIMS

A MERN-stack platform connecting patients and families visiting AIIMS Raipur for treatment with owners renting short-term homes nearby.

## Problem

Many patients traveling to AIIMS Raipur for treatment (often for weeks or months) struggle to find affordable, trustworthy short-term housing close to the hospital. NearAIIMS bridges that gap by connecting them directly with local homeowners.

## Features

- User registration and login with JWT-based authentication, stored in httpOnly cookies
- Password hashing with bcrypt
- Property listings with image uploads (multer)
- Search and filter properties by location, property type, and price range
- Booking request system connecting renters and property owners
- Owner-only accept/decline flow, with date-overlap conflict detection to prevent double-booking
- Ownership-based authorization on every protected route (users can only modify their own listings/bookings)
- Centralized error handling via a custom `AppError` class and a single error-handling middleware
- React frontend with client-side routing (React Router)
- Global authentication state via React Context, persisted across page refreshes
- Protected frontend routes that redirect unauthenticated users to login

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, Context API

**Backend:** Node.js, Express, MongoDB, Mongoose

**Auth:** JWT, bcrypt, httpOnly cookies

**File uploads:** Multer

## Project Structure

```
Near-AIIMS-Fresh/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── context/     # AuthContext — global auth state
│       ├── pages/       # Login, Register, and other route-level pages
│       └── components/  # Reusable components (e.g. ProtectedRoute)
└── server/          # Express backend
    ├── config/          # Database connection
    ├── middleware/       # requireAuth, upload (multer), errorHandler
    ├── models/           # User, Property, Booking (Mongoose schemas)
    ├── routes/           # authRoutes, propertyRoutes, bookingRoutes
    ├── utils/            # AppError class
    └── uploads/          # Uploaded property images (local dev only)
```

## Setup

### Prerequisites
- Node.js installed
- A MongoDB Atlas connection string (or local MongoDB instance)

### Backend

```bash
cd server
npm install
```

Create a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```

Run the server:
```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on Vite's default port (typically `5173`) and talks to the backend at `http://localhost:5000`.

## API Overview

| Method | Route | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new user | No |
| POST | `/api/auth/login` | Log in, sets auth cookie | No |
| GET | `/api/auth/me` | Get current logged-in user | Yes |
| GET | `/api/properties` | List properties, supports filters | No |
| GET | `/api/properties/:id` | Get one property | No |
| POST | `/api/properties` | Create a property listing | Yes |
| PUT | `/api/properties/:id` | Update a listing (owner only) | Yes |
| DELETE | `/api/properties/:id` | Delete a listing (owner only) | Yes |
| POST | `/api/bookings` | Request a booking | Yes |
| GET | `/api/bookings/mine` | Bookings made as a renter | Yes |
| GET | `/api/bookings/received` | Booking requests received as an owner | Yes |
| PUT | `/api/bookings/:id/status` | Accept/decline a booking (owner only) | Yes |

## Status

Currently in active development. Backend (auth, properties, bookings) and core frontend auth flow (login/register, protected routes) are complete. Remaining work: full browse/filter UI, property detail pages, booking forms, owner dashboard, styling, and deployment.

## Known Limitations

- Image uploads currently save to local disk (`server/uploads`) — this does not persist across deploys on platforms with ephemeral filesystems (Render, Railway). Planned fix: migrate to cloud storage (Cloudinary) before deployment.