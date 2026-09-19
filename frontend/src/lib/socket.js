import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: { token: localStorage.getItem('hr_token') },
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  s.auth = { token: localStorage.getItem('hr_token') }
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect()
}

// Typed event emitters
export const socketEvents = {
  // Incidents
  INCIDENT_CREATED:  'incident:created',
  INCIDENT_UPDATED:  'incident:updated',
  INCIDENT_DELETED:  'incident:deleted',
  // Survivors
  SURVIVOR_ADDED:    'survivor:added',
  SURVIVOR_UPDATED:  'survivor:updated',
  // Teams
  TEAM_LOCATION:     'team:location',
  TEAM_STATUS:       'team:status',
  // Alerts
  ALERT_BROADCAST:   'alert:broadcast',
  // System
  CONNECTED:         'connect',
  DISCONNECTED:      'disconnect',
}
