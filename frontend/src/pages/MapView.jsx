import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'
import styles from './MapView.module.css'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapView() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [activeLayer, setActiveLayer] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)

  const { incidents, survivors, teams, fetchIncidents, fetchSurvivors, fetchTeams } = useAppStore()

  useEffect(() => {
    fetchIncidents()
    fetchSurvivors()
    fetchTeams()
  }, [])

  useEffect(() => {
    // Guard: if no real Mapbox token, show fallback
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('placeholder')) {
      setMapError(true)
      return
    }

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.default.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [77.3910, 28.5355], // Default to India
        zoom: 11,
      })

      map.on('load', () => {
        setMapLoaded(true)
        map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right')
        map.addControl(new mapboxgl.default.ScaleControl(), 'bottom-left')
      })

      map.on('error', () => setMapError(true))
      mapInstance.current = map
    }).catch(() => setMapError(true))

    return () => mapInstance.current?.remove()
  }, [])

  // Update markers when data or layer changes
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current) return
    import('mapbox-gl').then((mapboxgl) => {
      // Clear old markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      if (activeLayer === 'all' || activeLayer === 'incidents') {
        incidents.forEach((inc) => {
          if (!inc.latitude || !inc.longitude) return
          const el = createMarkerEl('incident', inc.priority)
          el.addEventListener('click', () => setSelectedItem({ type: 'incident', data: inc }))
          const m = new mapboxgl.default.Marker({ element: el })
            .setLngLat([inc.longitude, inc.latitude])
            .addTo(mapInstance.current)
          markersRef.current.push(m)
        })
      }

      if (activeLayer === 'all' || activeLayer === 'survivors') {
        survivors.forEach((sv) => {
          if (!sv.latitude || !sv.longitude) return
          const el = createMarkerEl('survivor', sv.status)
          el.addEventListener('click', () => setSelectedItem({ type: 'survivor', data: sv }))
          const m = new mapboxgl.default.Marker({ element: el })
            .setLngLat([sv.longitude, sv.latitude])
            .addTo(mapInstance.current)
          markersRef.current.push(m)
        })
      }

      if (activeLayer === 'all' || activeLayer === 'teams') {
        teams.forEach((team) => {
          if (!team.latitude || !team.longitude) return
          const el = createMarkerEl('team', team.status)
          el.addEventListener('click', () => setSelectedItem({ type: 'team', data: team }))
          const m = new mapboxgl.default.Marker({ element: el })
            .setLngLat([team.longitude, team.latitude])
            .addTo(mapInstance.current)
          markersRef.current.push(m)
        })
      }
    })
  }, [mapLoaded, incidents, survivors, teams, activeLayer])

  return (
    <div className={styles.page}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.layerFilters}>
          {LAYERS.map(l => (
            <button
              key={l.value}
              className={`${styles.layerBtn} ${activeLayer === l.value ? styles.layerBtnActive : ''}`}
              onClick={() => setActiveLayer(l.value)}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
              {l.value !== 'all' && <span className={styles.layerCount}>{getCount(l.value, incidents, survivors, teams)}</span>}
            </button>
          ))}
        </div>

        <div className={styles.mapLegend}>
          <LegendItem color="#ff1744" label="Critical" />
          <LegendItem color="#ff6d00" label="High" />
          <LegendItem color="#ffd600" label="Survivor" />
          <LegendItem color="#00d4ff" label="Team" />
        </div>
      </div>

      {/* Map container */}
      <div className={styles.mapWrap}>
        {mapError ? (
          <MapFallback incidents={incidents} survivors={survivors} teams={teams} />
        ) : (
          <div ref={mapRef} className={styles.map} />
        )}
        {!mapLoaded && !mapError && (
          <div className={styles.mapLoading}>
            <div className={styles.mapLoadSpinner} />
            <span>Initializing map...</span>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedItem && (
        <div className={styles.detailPanel}>
          <button className={styles.detailClose} onClick={() => setSelectedItem(null)}>✕</button>
          <DetailContent item={selectedItem} />
        </div>
      )}

      {/* Stats overlay */}
      <div className={styles.statsOverlay}>
        <StatPill icon="🚨" label="Incidents" value={incidents.length} color="alert" />
        <StatPill icon="👤" label="Survivors" value={survivors.length} color="yellow" />
        <StatPill icon="🚁" label="Teams" value={teams.length} color="cyan" />
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function createMarkerEl(type, state) {
  const el = document.createElement('div')
  el.className = `hr-marker hr-marker--${type} hr-marker--${state}`

  const colors = {
    incident: { critical:'#ff1744', high:'#ff6d00', medium:'#ffd600', low:'#00e676' },
    survivor: { critical:'#ff1744', missing:'#ff6d00', found:'#ffd600', rescued:'#00e676' },
    team:     { deployed:'#00d4ff', available:'#00e676', offline:'#546e7a' },
  }

  const color = colors[type]?.[state] || (type === 'team' ? '#00d4ff' : '#ff6d00')

  el.style.cssText = `
    width: ${type === 'team' ? '20px' : '14px'};
    height: ${type === 'team' ? '20px' : '14px'};
    border-radius: 50%;
    background: ${color};
    border: 2px solid rgba(255,255,255,0.6);
    box-shadow: 0 0 8px ${color}88, 0 0 0 4px ${color}22;
    cursor: pointer;
    transition: transform 0.15s ease;
    position: relative;
  `

  // Pulse ring for critical
  if (state === 'critical') {
    const ring = document.createElement('div')
    ring.style.cssText = `
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid ${color};
      animation: pulse-ring 1.5s ease-out infinite;
    `
    el.appendChild(ring)
  }

  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.4)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

function getCount(layer, incidents, survivors, teams) {
  if (layer === 'incidents') return incidents.length
  if (layer === 'survivors') return survivors.length
  if (layer === 'teams') return teams.length
  return 0
}

// Fallback when no Mapbox token
function MapFallback({ incidents, survivors, teams }) {
  return (
    <div className={styles.fallback}>
      <div className={styles.fallbackGrid}>
        <div className={styles.fallbackMsg}>
          <div className={styles.fallbackIcon}>🗺️</div>
          <div className={styles.fallbackTitle}>Map Preview</div>
          <div className={styles.fallbackSub}>
            Add your Mapbox token to <code>VITE_MAPBOX_TOKEN</code> in <code>.env</code> to enable the live map
          </div>
        </div>
        <div className={styles.fallbackData}>
          <DataTable title="Incidents" items={incidents} color="#ff4d1c" />
          <DataTable title="Survivors" items={survivors} color="#ffd600" />
          <DataTable title="Teams" items={teams} color="#00d4ff" />
        </div>
      </div>
    </div>
  )
}

function DataTable({ title, items, color }) {
  return (
    <div className={styles.dataTable}>
      <div className={styles.dataTableTitle} style={{ color }}>{title} ({items.length})</div>
      {items.slice(0,4).map((item, i) => (
        <div key={i} className={styles.dataRow}>
          <span className={styles.dataDot} style={{ background: color }} />
          <span className={styles.dataName}>{item.title || item.name || `#${item.id}`}</span>
          <span className={styles.dataStatus}>{item.status || item.priority}</span>
        </div>
      ))}
      {items.length === 0 && <div className={styles.dataEmpty}>No data yet</div>}
    </div>
  )
}

function DetailContent({ item }) {
  const { type, data } = item
  if (type === 'incident') return (
    <div className={styles.detail}>
      <div className={styles.detailType}>🚨 INCIDENT</div>
      <div className={styles.detailTitle}>{data.title}</div>
      <div className={styles.detailMeta}>
        <span>Priority: <b>{data.priority}</b></span>
        <span>Status: <b>{data.status}</b></span>
        <span>Type: <b>{data.type}</b></span>
      </div>
      {data.description && <p className={styles.detailDesc}>{data.description}</p>}
    </div>
  )
  if (type === 'survivor') return (
    <div className={styles.detail}>
      <div className={styles.detailType}>👤 SURVIVOR</div>
      <div className={styles.detailTitle}>{data.name || 'Unknown'}</div>
      <div className={styles.detailMeta}>
        <span>Status: <b>{data.status}</b></span>
        {data.medical_condition && <span>Condition: <b>{data.medical_condition}</b></span>}
      </div>
    </div>
  )
  if (type === 'team') return (
    <div className={styles.detail}>
      <div className={styles.detailType}>🚁 TEAM</div>
      <div className={styles.detailTitle}>{data.name}</div>
      <div className={styles.detailMeta}>
        <span>Status: <b>{data.status}</b></span>
        <span>Members: <b>{data.member_count || data.size}</b></span>
      </div>
    </div>
  )
  return null
}

function LegendItem({ color, label }) {
  return (
    <div className={styles.legendItem}>
      <span className={styles.legendDot} style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}

function StatPill({ icon, label, value, color }) {
  return (
    <div className={`${styles.statPill} ${styles[`sp_${color}`]}`}>
      <span>{icon}</span>
      <span className={styles.spValue}>{value}</span>
      <span className={styles.spLabel}>{label}</span>
    </div>
  )
}

const LAYERS = [
  { value: 'all',       icon: '⬡',  label: 'All' },
  { value: 'incidents', icon: '🚨',  label: 'Incidents' },
  { value: 'survivors', icon: '👤',  label: 'Survivors' },
  { value: 'teams',     icon: '🚁',  label: 'Teams' },
]
