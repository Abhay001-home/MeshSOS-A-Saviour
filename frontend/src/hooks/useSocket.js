import { useEffect } from 'react'
import { getSocket, socketEvents } from '../lib/socket'
import { useAppStore } from '../store/appStore'
import toast from 'react-hot-toast'

export function useSocket() {
  const {
    socketIncidentCreated,
    socketIncidentUpdated,
    socketIncidentDeleted,
    socketSurvivorAdded,
    socketSurvivorUpdated,
    socketTeamLocation,
    addAlert,
  } = useAppStore()

  useEffect(() => {
    const socket = getSocket()

    socket.on(socketEvents.INCIDENT_CREATED, (data) => {
      socketIncidentCreated(data)
      toast(`🚨 New incident: ${data.title}`, { duration: 5000 })
    })

    socket.on(socketEvents.INCIDENT_UPDATED, (data) => {
      socketIncidentUpdated(data)
    })

    socket.on(socketEvents.INCIDENT_DELETED, ({ id }) => {
      socketIncidentDeleted(id)
    })

    socket.on(socketEvents.SURVIVOR_ADDED, (data) => {
      socketSurvivorAdded(data)
      toast.success(`Survivor located: ${data.name || 'Unknown'}`)
    })

    socket.on(socketEvents.SURVIVOR_UPDATED, (data) => {
      socketSurvivorUpdated(data)
    })

    socket.on(socketEvents.TEAM_LOCATION, (data) => {
      socketTeamLocation(data)
    })

    socket.on(socketEvents.ALERT_BROADCAST, (alert) => {
      addAlert(alert)
      if (alert.severity === 'critical') {
        toast.error(`⚠️ CRITICAL: ${alert.message}`, { duration: 8000 })
      }
    })

    return () => {
      socket.off(socketEvents.INCIDENT_CREATED)
      socket.off(socketEvents.INCIDENT_UPDATED)
      socket.off(socketEvents.INCIDENT_DELETED)
      socket.off(socketEvents.SURVIVOR_ADDED)
      socket.off(socketEvents.SURVIVOR_UPDATED)
      socket.off(socketEvents.TEAM_LOCATION)
      socket.off(socketEvents.ALERT_BROADCAST)
    }
  }, [])
}
