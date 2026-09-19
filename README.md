# MeshSOS-A-Saviour

MeshSOS is a disaster-response command dashboard built to help teams monitor incidents, coordinate rescue operations, and manage resources in real time.

This repository currently contains the frontend application for a live emergency management system. The app includes protected routes, a dashboard, incident tracking, survivor management, team coordination, resource allocation, and a map-based operational view.

## Overview

The interface is designed for emergency coordination centers and field operations teams. It supports:

- incident monitoring and status tracking
- survivor intake and status updates
- team deployment visibility
- resource allocation and utilization tracking
- dashboard metrics and live activity feeds
- map-based operational awareness
- authentication and role-aware access

## Tech stack

- React 19
- Vite
- React Router
- Zustand state management
- Axios for API calls
- Mapbox GL for map rendering
- Socket.IO client for live updates
- date-fns and lucide-react for UI enhancements

## Project structure

```text
MeshSOS-A-Saviour/
├── README.md
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       └── store/
└── ...
```

## Main application routes

The app defines authenticated and public routes, including:

- /login
- /register
- /dashboard
- /map
- /incidents
- /survivors
- /teams
- /resources
- /users
- /settings

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or later
- npm
- a running backend API that exposes the endpoints used by the frontend
- a Mapbox access token for the live map

## Environment variables

Create a .env file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Notes:

- VITE_API_URL is the base URL for the backend service.
- The frontend defaults to http://localhost:5000 if this is not set.
- If VITE_MAPBOX_TOKEN is missing or set to a placeholder, the map view falls back to a preview state instead of rendering the live Mapbox map.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

The dev server will start with Vite and expose the frontend locally in the browser.

## Production build

```bash
cd frontend
npm run build
```

To preview the production build locally:

```bash
cd frontend
npm run preview
```

## Linting

```bash
cd frontend
npm run lint
```

## Notes

This project is structured as a frontend dashboard that expects a connected backend service for authentication, incidents, survivors, teams, resources, and dashboard metrics. The UI is ready for real-time operations workflows and is intended to be paired with a matching API service.
