# MeshSOS-A-Saviour

MeshSOS is a full-stack disaster-response command dashboard for emergency coordination, resource management, survivor tracking, and live operational awareness.

This repository includes both the backend API and the React frontend that work together to support incident operations, team coordination, and real-time updates across the response workflow.

## Overview

The platform is built for emergency response teams and coordination centers. It supports:

- incident creation, tracking, and status updates
- survivor intake and case management
- team deployment and location monitoring
- resource allocation and availability tracking
- dashboard metrics and activity streams
- map-based situational awareness
- role-based authentication and protected access
- real-time updates over Socket.IO

## Architecture

```text
MeshSOS-A-Saviour/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── README.md
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       ├── migrate.js
│       ├── seed.js
│       └── server.js
└── frontend/
    ├── package.json
    ├── .env.example
    ├── README.md
    ├── index.html
    ├── vite.config.js
    ├── public/
    └── src/
        ├── App.jsx
        ├── components/
        ├── hooks/
        ├── lib/
        ├── pages/
        ├── store/
        ├── App.css
        ├── index.css
        └── main.jsx
```

## Tech stack

### Frontend

- React 19
- Vite
- React Router
- Zustand
- Axios
- Mapbox GL
- Socket.IO client
- date-fns
- lucide-react

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- Socket.IO
- JWT authentication
- bcryptjs
- Helmet and CORS middleware

## Application flow

- The frontend provides the emergency operations interface.
- The backend exposes REST APIs for authentication, incidents, survivors, teams, resources, and dashboard stats.
- Real-time updates are broadcast via Socket.IO so the dashboard stays synchronized.
- MongoDB stores operational data for users, incidents, teams, survivors, and resources.

## Main routes

### Frontend

- `/login`
- `/register`
- `/dashboard`
- `/map`
- `/incidents`
- `/survivors`
- `/teams`
- `/resources`
- `/users`
- `/settings`

### Backend API

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me`
- `/api/incidents`
- `/api/survivors`
- `/api/teams`
- `/api/resources`
- `/api/dashboard/stats`
- `/api/users`

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+
- npm
- MongoDB running locally on port 27017
- a Mapbox token for the live map view

## Quick start

### 1) Start the backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

### 2) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Environment setup

### Backend

The backend uses a `.env` file in `backend/`.

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hyperrescue
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend

The frontend uses a `.env` file in `frontend/`.

Example:

```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Notes:

- `VITE_API_URL` is the backend base URL used by the frontend.
- If the token is missing or left as a placeholder, the map view falls back to a preview state instead of rendering live Mapbox content.

## Demo credentials

After seeding the backend, these sample accounts are available:

| Email | Password | Role |
| --- | --- | --- |
| admin@hyperrescue.local | admin123 | Admin |
| coord@hyperrescue.local | coord123 | Coordinator |
| meera@hyperrescue.local | coord123 | Medic |
| ravi@hyperrescue.local | coord123 | Responder |

## Production build

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Backend

```bash
cd backend
npm start
```

## Linting

```bash
cd frontend
npm run lint
```

## Notes

This project is designed as a full-stack emergency response platform. The frontend and backend are meant to run together, with the frontend handling user workflows and the backend providing persistence, authentication, and real-time operations support.
