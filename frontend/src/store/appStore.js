import { create } from 'zustand'
import { incidentsAPI, survivorsAPI, teamsAPI, resourcesAPI, dashboardAPI } from '../lib/api'

export const useAppStore = create((set, get) => ({
  // ── State ────────────────────────────────
  incidents: [],
  survivors: [],
  teams:     [],
  resources: [],
  stats:     null,
  activity:  [],
  alerts:    [],

  filters: {
    incidents: { status: 'all', priority: 'all', type: 'all' },
    survivors: { status: 'all' },
    teams:     { status: 'all' },
  },

  loading: { incidents: false, survivors: false, teams: false, resources: false, stats: false },
  error:   null,

  // Selected for detail panel
  selectedIncident: null,
  selectedSurvivor: null,
  selectedTeam:     null,

  // Map
  mapCenter:  [-74.006, 40.7128],
  mapZoom:    12,
  mapStyle:   'dark',

  // ── Incidents ────────────────────────────
  fetchIncidents: async (params) => {
    set(s => ({ loading: { ...s.loading, incidents: true } }))
    try {
      const { data } = await incidentsAPI.getAll(params)
      set(s => ({ incidents: data.incidents || data, loading: { ...s.loading, incidents: false } }))
    } catch (err) {
      set(s => ({ loading: { ...s.loading, incidents: false }, error: err.message }))
    }
  },

  createIncident: async (payload) => {
    const { data } = await incidentsAPI.create(payload)
    set(s => ({ incidents: [data, ...s.incidents] }))
    return data
  },

  updateIncident: async (id, payload) => {
    const { data } = await incidentsAPI.update(id, payload)
    set(s => ({ incidents: s.incidents.map(i => i.id === id ? data : i) }))
    return data
  },

  deleteIncident: async (id) => {
    await incidentsAPI.delete(id)
    set(s => ({ incidents: s.incidents.filter(i => i.id !== id) }))
  },

  // socket push
  socketIncidentCreated: (incident) =>
    set(s => ({ incidents: [incident, ...s.incidents] })),
  socketIncidentUpdated: (incident) =>
    set(s => ({ incidents: s.incidents.map(i => i.id === incident.id ? incident : i) })),
  socketIncidentDeleted: (id) =>
    set(s => ({ incidents: s.incidents.filter(i => i.id !== id) })),

  // ── Survivors ────────────────────────────
  fetchSurvivors: async (params) => {
    set(s => ({ loading: { ...s.loading, survivors: true } }))
    try {
      const { data } = await survivorsAPI.getAll(params)
      set(s => ({ survivors: data.survivors || data, loading: { ...s.loading, survivors: false } }))
    } catch (err) {
      set(s => ({ loading: { ...s.loading, survivors: false } }))
    }
  },

  createSurvivor: async (payload) => {
    const { data } = await survivorsAPI.create(payload)
    set(s => ({ survivors: [data, ...s.survivors] }))
    return data
  },

  updateSurvivor: async (id, payload) => {
    const { data } = await survivorsAPI.update(id, payload)
    set(s => ({ survivors: s.survivors.map(sv => sv.id === id ? data : sv) }))
    return data
  },

  socketSurvivorAdded:   (sv) => set(s => ({ survivors: [sv, ...s.survivors] })),
  socketSurvivorUpdated: (sv) => set(s => ({ survivors: s.survivors.map(x => x.id === sv.id ? sv : x) })),

  // ── Teams ─────────────────────────────────
  fetchTeams: async (params) => {
    set(s => ({ loading: { ...s.loading, teams: true } }))
    try {
      const { data } = await teamsAPI.getAll(params)
      set(s => ({ teams: data.teams || data, loading: { ...s.loading, teams: false } }))
    } catch (err) {
      set(s => ({ loading: { ...s.loading, teams: false } }))
    }
  },

  createTeam: async (payload) => {
    const { data } = await teamsAPI.create(payload)
    set(s => ({ teams: [data, ...s.teams] }))
    return data
  },

  socketTeamLocation: (update) =>
    set(s => ({
      teams: s.teams.map(t => t.id === update.teamId
        ? { ...t, latitude: update.lat, longitude: update.lng }
        : t
      )
    })),

  // ── Resources ─────────────────────────────
  fetchResources: async (params) => {
    set(s => ({ loading: { ...s.loading, resources: true } }))
    try {
      const { data } = await resourcesAPI.getAll(params)
      set(s => ({ resources: data.resources || data, loading: { ...s.loading, resources: false } }))
    } catch (err) {
      set(s => ({ loading: { ...s.loading, resources: false } }))
    }
  },

  // ── Dashboard ─────────────────────────────
  fetchStats: async () => {
    set(s => ({ loading: { ...s.loading, stats: true } }))
    try {
      const { data } = await dashboardAPI.getStats()
      const act = await dashboardAPI.getActivity()
      set(s => ({ stats: data, activity: act.data, loading: { ...s.loading, stats: false } }))
    } catch {
      // use mock stats when backend not ready
      set(s => ({
        stats: mockStats,
        activity: mockActivity,
        loading: { ...s.loading, stats: false }
      }))
    }
  },

  // ── Alerts (socket broadcast) ──────────────
  addAlert: (alert) =>
    set(s => ({ alerts: [{ ...alert, id: Date.now(), ts: new Date() }, ...s.alerts].slice(0, 50) })),
  clearAlerts: () => set({ alerts: [] }),

  // ── Selection ─────────────────────────────
  setSelectedIncident: (i) => set({ selectedIncident: i }),
  setSelectedSurvivor: (s) => set({ selectedSurvivor: s }),
  setSelectedTeam:     (t) => set({ selectedTeam: t }),

  // ── Map ───────────────────────────────────
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom:   (zoom)   => set({ mapZoom: zoom }),
}))

// ── Mock data for offline/dev ────────────────
const mockStats = {
  active_incidents: 12,
  survivors_found:  47,
  survivors_rescued:28,
  survivors_critical:8,
  teams_deployed:   6,
  teams_available:  3,
  resources_deployed:14,
  incidents_resolved:31,
  coverage_area_km2: 24.5,
  avg_response_min:  8.3,
}

const mockActivity = [
  { id:1, type:'incident', message:'New flood incident reported in Sector 4', ts: new Date(Date.now()-120000), severity:'critical' },
  { id:2, type:'survivor', message:'3 survivors located near Bridge St', ts: new Date(Date.now()-300000), severity:'high' },
  { id:3, type:'team',     message:'Team Alpha dispatched to Zone B', ts: new Date(Date.now()-600000), severity:'medium' },
  { id:4, type:'resource', message:'Medical supplies allocated to Field Hospital', ts: new Date(Date.now()-900000), severity:'low' },
  { id:5, type:'resolved', message:'Incident #23 marked as resolved', ts: new Date(Date.now()-1800000), severity:'resolved' },
]
