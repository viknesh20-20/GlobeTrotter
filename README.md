# 🌍 GlobeTrotter - Travel Planning Platform

A full-stack travel planning application that helps users discover destinations, plan trips, build itineraries, and connect with fellow travelers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![React](https://img.shields.io/badge/react-18.x-61dafb)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Structure](#frontend-structure)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

GlobeTrotter is a comprehensive travel planning platform designed to simplify the process of planning, organizing, and sharing travel experiences. Whether you're a solo traveler, a travel agency, or an admin managing the platform, GlobeTrotter provides the tools you need.

## ✨ Features

### 🗺️ Destination Discovery
- Browse cities and destinations worldwide
- Filter by region, cost index, and popularity
- View detailed city information including highlights, best time to visit, and daily budget estimates

### 🎒 Trip Planning
- Create and manage trips with multiple destinations
- Set trip dates, budget estimates, and descriptions
- Add cities to your trip itinerary
- Track trip status (upcoming, ongoing, completed)

### 📅 Itinerary Builder
- Build detailed day-by-day itineraries
- Add activities, meals, and transportation
- Automatic cost calculation
- Drag-and-drop scheduling

### 🎯 Activity Management
- Discover activities by city and category
- View activity details, duration, and costs
- Add activities to trips and itineraries

### 👥 Community Features
- Share travel experiences with posts
- Like and save posts from other travelers
- View trending destinations
- Connect with fellow travelers

### 📊 Admin Dashboard
- User management with role-based access
- Trip analytics and statistics
- Platform-wide metrics and insights

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (Admin, Traveler, Agency)
- Token refresh mechanism
- Protected routes

---

## 🛠️ Tech Stack

### Backend (`globetrotterAPI`)
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **express-validator** | Input validation |
| **Clean Architecture** | Code organization |

### Frontend (`globetrotterUI`)
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **React Router** | Navigation |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **Context API** | State management |

---

## 🏗️ Architecture

### Backend Architecture (Clean Architecture)

```
globetrotterAPI/
├── src/
│   ├── domain/              # Business entities
│   │   └── entities/
│   ├── application/         # Use cases & interfaces
│   │   ├── services/
│   │   └── interfaces/
│   ├── infrastructure/      # External implementations
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── repositories/
│   │   └── http/
│   │       ├── controllers/
│   │       ├── routes/
│   │       └── middleware/
│   └── index.ts            # Application entry
```

### Frontend Architecture

```
globetrotterUI/
├── src/
│   ├── components/         # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── types/             # TypeScript types
│   └── data/              # Mock/fallback data
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/globetrotter.git
   cd GlobeTrotter
   ```

2. **Install Backend Dependencies**
   ```bash
   cd globetrotterAPI
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../globetrotterUI
   npm install
   ```

### Database Setup

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE globetrotterdb;
   ```

2. **Configure Database Connection**
   
   Create `globetrotterAPI/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=globetrotterdb
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   
   PORT=3000
   NODE_ENV=development
   ```

3. **Run Database Migrations**
   ```bash
   cd globetrotterAPI
   npm run build
   node dist/infrastructure/database/migrate.js
   ```

4. **Seed Demo Data**
   ```bash
   node dist/infrastructure/database/seed.js
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd globetrotterAPI
   npm run dev
   ```
   Backend runs at: `http://localhost:3000`

2. **Start the Frontend Development Server**
   ```bash
   cd globetrotterUI
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | User logout |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | ✅ |
| PUT | `/users/profile` | Update user profile | ✅ |
| GET | `/users/preferences` | Get user preferences | ✅ |
| PUT | `/users/preferences` | Update preferences | ✅ |

### City Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cities` | List all cities | ✅ |
| GET | `/cities/:id` | Get city by ID | ✅ |
| GET | `/cities/regions` | Get all regions | ✅ |
| POST | `/cities` | Create city | ✅ Admin |
| PUT | `/cities/:id` | Update city | ✅ Admin |
| DELETE | `/cities/:id` | Delete city | ✅ Admin |

### Activity Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/activities` | List all activities | ✅ |
| GET | `/activities/:id` | Get activity by ID | ✅ |
| GET | `/activities/categories` | Get categories | ✅ |
| GET | `/activities/city/:cityId` | Get by city | ✅ |
| POST | `/activities` | Create activity | ✅ Admin |

### Trip Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/trips/my` | Get user's trips | ✅ |
| GET | `/trips/:id` | Get trip by ID | ✅ |
| POST | `/trips` | Create new trip | ✅ |
| PUT | `/trips/:id` | Update trip | ✅ |
| DELETE | `/trips/:id` | Delete trip | ✅ |

### Itinerary Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/itineraries/trip/:tripId` | Get trip itinerary | ✅ |
| POST | `/itineraries` | Create itinerary | ✅ |
| PUT | `/itineraries/:id` | Update itinerary | ✅ |

### Community Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/community/posts` | Get all posts | ✅ |
| GET | `/community/featured` | Featured destinations | ✅ |
| POST | `/community/posts` | Create post | ✅ |
| POST | `/community/posts/:id/like` | Like post | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/users` | List all users | ✅ Admin |
| GET | `/admin/trips` | List all trips | ✅ Admin |
| GET | `/admin/analytics` | Platform analytics | ✅ Admin |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "traveler"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Create Trip
```bash
POST /api/trips
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "European Adventure",
  "description": "Exploring Western Europe",
  "start_date": "2026-06-01",
  "end_date": "2026-06-15",
  "cities": [1, 2, 3]
}
```

---

## 🎨 Frontend Structure

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | User dashboard with trip overview |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |
| My Trips | `/trips` | User's trip list |
| Create Trip | `/trips/new` | Create new trip |
| Trip View | `/trips/:id` | View trip details |
| Itinerary View | `/itinerary/:tripId` | View/edit itinerary |
| Itinerary Builder | `/itinerary/:tripId/builder` | Build itinerary |
| City Search | `/cities` | Browse destinations |
| Activity Search | `/activities` | Browse activities |
| Community | `/community` | Social features |
| Profile | `/profile` | User profile |
| Admin Dashboard | `/admin` | Admin panel |

### Context Providers

- **AuthContext** - Authentication state and methods
- **DataContext** - Application data with API integration
- **ThemeContext** - Dark/light mode theming

### Key Components

- **MainLayout** - Authenticated layout with sidebar
- **AuthLayout** - Public layout for auth pages
- **Header** - Top navigation bar
- **Sidebar** - Side navigation menu

---

## 🔐 Authentication

### JWT Token Flow

1. User logs in with email/password
2. Server validates credentials and returns:
   - **Access Token** (24 hours expiry)
   - **Refresh Token** (7 days expiry)
3. Frontend stores tokens in localStorage
4. Access token sent in `Authorization: Bearer <token>` header
5. When access token expires, use refresh token to get new tokens

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **traveler** | Create/manage own trips, view destinations |
| **agency** | All traveler permissions + agency features |
| **admin** | Full access including user management |

---

## ⚙️ Environment Variables

### Backend (`globetrotterAPI/.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globetrotterdb
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (`globetrotterUI/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 👤 Demo Accounts

After running the seed script, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Traveler | `demo@globetrotter.com` | `demo123` |
| Admin | `admin@globetrotter.com` | `admin123` |
| Agency | `agency@globetrotter.com` | `agency123` |

---

## 📁 Project Structure

```
GlobeTrotter/
├── globetrotterAPI/           # Backend API
│   ├── src/
│   │   ├── domain/           # Business entities
│   │   ├── application/      # Services & interfaces
│   │   ├── infrastructure/   # Database & HTTP layer
│   │   └── index.ts         # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── globetrotterUI/            # Frontend Application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/         # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── data/            # Mock data
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md                  # This file
```

---

## 🧪 Development

### Backend Commands

```bash
cd globetrotterAPI

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run migrations
node dist/infrastructure/database/migrate.js

# Seed database
node dist/infrastructure/database/seed.js
```

### Frontend Commands

```bash
cd globetrotterUI

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists

**2. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
- Stop other processes using the port
- Or change PORT in `.env`

**3. CORS Errors**
- Backend is configured to allow `http://localhost:5173`
- For other origins, update CORS settings in backend

**4. API Not Available (Frontend Fallback)**
- DataContext auto-detects API availability
- Falls back to mock JSON data if API unreachable
- Check console for connection status

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Unsplash](https://unsplash.com) for placeholder images
- [Lucide](https://lucide.dev) for icons
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations

---

<p align="center">
  Made with ❤️ for travelers worldwide
</p>
