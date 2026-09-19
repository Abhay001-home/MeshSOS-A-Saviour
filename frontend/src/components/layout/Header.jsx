import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import styles from './Header.module.css'

const PAGE_TITLES = {
  '/dashboard':  { title: 'Command Dashboard', sub: 'Real-time ops overview' },
  '/map':        { title: 'Live Operations Map', sub: 'Survivor & team tracking' },
  '/incidents':  { title: 'Incident Management', sub: 'Active emergency events' },
  '/survivors':  { title: 'Survivor Registry', sub: 'Tracked individuals' },
  '/teams':      { title: 'Response Teams', sub: 'Field units & deployment' },
  '/resources':  { title: 'Resource Inventory', sub: 'Equipment & supplies' },
  '/users':      { title: 'User Management', sub: 'System operators' },
  '/settings':   { title: 'System Settings', sub: 'Configuration' },
}

export default function Header({ onToggleSidebar }) {
  const location = useLocation()
  const { alerts, stats } = useAppStore()
  const [time, setTime] = useState(new Date())
  const [searchVal, setSearchVal] = useState('')

  const page = PAGE_TITLES[location.pathname] || { title: 'HyperRescue', sub: '' }
  const criticals = alerts.filter(a => !a.read && a.severity === 'critical').length

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className={styles.header}>
      {/* Page title */}
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>{page.title}</h1>
        <span className={styles.pageSub}>{page.sub}</span>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <SearchIcon />
        <input
          className={styles.searchInput}
          placeholder="Search incidents, survivors, teams..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
        />
        <span className={styles.searchKbd}>⌘K</span>
      </div>

      {/* Right controls */}
      <div className={styles.controls}>
        {/* Live indicator */}
        <div className={styles.liveChip}>
          <span className={styles.liveDot} />
          <span>LIVE</span>
        </div>

        {/* Clock */}
        <div className={styles.clock}>
          <span className={styles.clockTime}>
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span className={styles.clockDate}>
            {time.toLocaleDateString('en-US', { month:'short', day:'numeric' })}
          </span>
        </div>

        {/* Alerts bell */}
        <button className={styles.iconBtn} title="Alerts">
          <BellIcon />
          {criticals > 0 && (
            <span className={styles.bellBadge}>{criticals}</span>
          )}
        </button>

        {/* Quick stats row */}
        {stats && (
          <div className={styles.quickStats}>
            <QuickStat label="ACTIVE" value={stats.active_incidents} color="alert" />
            <QuickStat label="RESCUED" value={stats.survivors_rescued} color="green" />
            <QuickStat label="TEAMS" value={stats.teams_deployed} color="cyan" />
          </div>
        )}
      </div>
    </header>
  )
}

function QuickStat({ label, value, color }) {
  return (
    <div className={`${styles.quickStat} ${styles[`qs_${color}`]}`}>
      <span className={styles.qsVal}>{value ?? '—'}</span>
      <span className={styles.qsLabel}>{label}</span>
    </div>
  )
}

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function BellIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
