# MeshSOS Frontend

This is the React/Vite frontend for the MeshSOS disaster-response command dashboard. It provides an operational interface for monitoring incidents, tracking survivors, coordinating teams, managing resources, and viewing live system updates from a connected backend.

## Overview

The frontend is designed for emergency response coordination and runs as a secure dashboard with protected routes. Core features include:

- Authentication flow for login and registration
- Dashboard with operational metrics and activity feed
- Incident management and status updates
- Survivor tracking and record management
- Team deployment and operational status views
- Resource allocation and availability tracking
- Map-based incident and team overview
- Real-time notifications using Socket.IO

## Tech stack

- React 19
- Vite
- React Router
- Zustand
- Axios
- Socket.IO client
- Mapbox GL
- date-fns
- react-hot-toast

## Project structure

```text
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── App.css
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── store/
└── README.md
```

## Application routes

The app uses route-based access control:

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

Authenticated users are redirected to the dashboard, while unauthenticated users are redirected to login.

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or later
- npm
- a running backend API on the expected host/port
- a Mapbox token for the live map view

## Environment setup

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### Notes

- `VITE_API_URL` is used by the API client for backend calls.
- If no API URL is set, the app falls back to `http://localhost:5000`.
- If `VITE_MAPBOX_TOKEN` is missing or still a placeholder, the map page will show a fallback preview instead of rendering the live map.

## Installation

```bash
cd frontend
npm install
```

## Run the app locally

```bash
cd frontend
npm run dev
```

The Vite development server will start and serve the app locally, typically on:

```text
http://localhost:5173
```

## Production build

```bash
cd frontend
npm run build
```

To preview the production build:

```bash
cd frontend
npm run preview
```

## Linting

```bash
cd frontend
npm run lint
```

## Backend dependency

This frontend expects a compatible backend service to provide:

- authentication endpoints
- incident data
- survivor records
- team locations and status
- resources and dashboard stats
- real-time socket events

The frontend communicates with the backend through the `VITE_API_URL` base URL and uses the Socket.IO client for live updates.

## Notes

This app is intended to be used with the MeshSOS backend service in the same project. The UI itself is already structured for emergency operations workflows, but it depends on the backend for persistent data and real-time events.
