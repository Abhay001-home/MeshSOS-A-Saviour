# ⬡ MeshSOS Backend — MongoDB Edition

> Node.js + Express + MongoDB (Mongoose) + Socket.IO

---

## Prerequisites

- Node.js v18+
- MongoDB Community running locally on port 27017

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (already set up)
# .env contains:
#   MONGO_URI=mongodb://127.0.0.1:27017/hyperrescue
#   JWT_SECRET=...
#   CORS_ORIGIN=http://localhost:5173

# 3. Seed demo data (creates DB + collections automatically)
npm run seed

# 4. Start dev server
npm run dev
```

Server → **http://localhost:5000**
Health → http://localhost:5000/health

---

## Demo Credentials (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@hyperrescue.local | admin123 | Admin |
| coord@hyperrescue.local | coord123 | Coordinator |
| meera@hyperrescue.local | coord123 | Medic |
| ravi@hyperrescue.local  | coord123 | Responder |

---

## MongoDB Collections

| Collection   | Mongoose Model | Description |
|--------------|----------------|-------------|
| users        | User           | Operators & admins |
| incidents    | Incident       | Emergency events |
| survivors    | Survivor       | Located individuals |
| teams        | Team           | Response units |
| resources    | Resource       | Equipment & supplies |
| activitylogs | ActivityLog    | Audit trail |

---

## API Reference

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Incidents
```
GET    /api/incidents           ?status=&priority=&type=&limit=&offset=
POST   /api/incidents
GET    /api/incidents/:id
PATCH  /api/incidents/:id
DELETE /api/incidents/:id       (coordinator+)
PATCH  /api/incidents/:id/status
POST   /api/incidents/:id/assign
```

### Survivors
```
GET    /api/survivors           ?status=&incident_id=
POST   /api/survivors
GET    /api/survivors/:id
PATCH  /api/survivors/:id
PATCH  /api/survivors/:id/status
```

### Teams
```
GET    /api/teams               ?status=
POST   /api/teams               (coordinator+)
GET    /api/teams/:id
PATCH  /api/teams/:id           (coordinator+)
DELETE /api/teams/:id           (coordinator+)
PATCH  /api/teams/:id/location  { lat, lng }
```

### Resources
```
GET    /api/resources           ?status=&type=
POST   /api/resources
PATCH  /api/resources/:id
DELETE /api/resources/:id       (coordinator+)
POST   /api/resources/:id/allocate
```

### Dashboard
```
GET  /api/dashboard/stats
GET  /api/dashboard/activity    ?limit=
POST /api/dashboard/broadcast   { message, severity }
```

### Users (admin only)
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
```

---

## Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `incident:created` | server→clients | incident doc |
| `incident:updated` | server→clients | incident doc |
| `incident:deleted` | server→clients | `{ id }` |
| `survivor:added`   | server→clients | survivor doc |
| `survivor:updated` | server→clients | survivor doc |
| `team:location`    | server→clients | `{ teamId, lat, lng, name, status }` |
| `team:status`      | server→clients | team doc |
| `alert:broadcast`  | server→clients | `{ message, severity, sender }` |
| `team:ping`        | client→server  | `{ teamId, lat, lng }` |
