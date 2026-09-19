import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/appStore'
import { StatCard, Card, Badge } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { stats, activity, fetchStats, incidents, fetchIncidents } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
    fetchIncidents({ limit: 5 })
  }, [])

  const recentIncidents = incidents.slice(0, 6)

  return (
    <div className={styles.page}>
      {/* Welcome banner */}
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <div className={styles.bannerTitle}>Command Center Active</div>
          <div className={styles.bannerSub}>
            Real-time disaster coordination — {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
        <div className={styles.bannerActions}>
          <button className={styles.quickAction} onClick={() => navigate('/incidents')}>
            <span>🚨</span> Report Incident
          </button>
          <button className={styles.quickAction} onClick={() => navigate('/survivors')}>
            <span>👤</span> Log Survivor
          </button>
          <button className={styles.quickAction} onClick={() => navigate('/map')}>
            <span>🗺️</span> Open Map
          </button>
        </div>
      </div>

      {/* Primary stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="ACTIVE INCIDENTS"
          value={stats?.active_incidents}
          sub="Requires immediate response"
          color="alert"
          icon="🚨"
          trend={stats ? -12 : undefined}
        />
        <StatCard
          label="SURVIVORS FOUND"
          value={stats?.survivors_found}
          sub={`${stats?.survivors_rescued || 0} rescued`}
          color="cyan"
          icon="🔍"
          trend={stats ? +8 : undefined}
        />
        <StatCard
          label="CRITICAL CASES"
          value={stats?.survivors_critical}
          sub="Needs immediate medical"
          color="alert"
          icon="🏥"
        />
        <StatCard
          label="TEAMS DEPLOYED"
          value={stats?.teams_deployed}
          sub={`${stats?.teams_available || 0} on standby`}
          color="green"
          icon="👥"
        />
        <StatCard
          label="RESOURCES OUT"
          value={stats?.resources_deployed}
          sub="Field allocation"
          color="yellow"
          icon="📦"
        />
        <StatCard
          label="RESOLVED TODAY"
          value={stats?.incidents_resolved}
          sub="Closed incidents"
          color="green"
          icon="✅"
          trend={stats ? +23 : undefined}
        />
      </div>

      {/* Lower grid */}
      <div className={styles.lowerGrid}>
        {/* Activity feed */}
        <Card className={styles.activityCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Live Activity Feed</h2>
            <span className={styles.liveTag}><span className={styles.liveDot}/>LIVE</span>
          </div>
          <div className={styles.activityList}>
            {(activity.length ? activity : MOCK_ACTIVITY).map((item) => (
              <div key={item.id} className={styles.activityItem}>
                <span className={`${styles.actIcon} ${styles[`act_${item.type}`]}`}>
                  {TYPE_ICONS[item.type] || '•'}
                </span>
                <div className={styles.actContent}>
                  <span className={styles.actMsg}>{item.message}</span>
                  <span className={styles.actTime}>
                    {formatDistanceToNow(new Date(item.ts), { addSuffix: true })}
                  </span>
                </div>
                <SeverityDot severity={item.severity} />
              </div>
            ))}
          </div>
        </Card>

        {/* Coverage metrics */}
        <Card className={styles.metricsCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Coverage Metrics</h2>
          </div>
          <div className={styles.metricsList}>
            <Metric label="Coverage Area" value={`${stats?.coverage_area_km2 || 24.5} km²`} bar={72} color="cyan" />
            <Metric label="Avg Response Time" value={`${stats?.avg_response_min || 8.3} min`} bar={58} color="green" />
            <Metric label="Team Utilization" value="78%" bar={78} color="yellow" />
            <Metric label="Resource Deployment" value="63%" bar={63} color="alert" />
            <Metric label="Survivor Recovery Rate" value="59%" bar={59} color="purple" />
          </div>
        </Card>

        {/* Recent incidents */}
        <Card className={styles.incidentsCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Incidents</h2>
            <button className={styles.viewAll} onClick={() => navigate('/incidents')}>View all →</button>
          </div>
          <div className={styles.incidentList}>
            {(recentIncidents.length ? recentIncidents : MOCK_INCIDENTS).map((inc) => (
              <div key={inc.id} className={styles.incidentRow} onClick={() => navigate('/incidents')}>
                <div className={`${styles.incPriDot} ${styles[`pri_${inc.priority}`]}`} />
                <div className={styles.incContent}>
                  <span className={styles.incTitle}>{inc.title}</span>
                  <span className={styles.incMeta}>
                    {inc.type} · {inc.location_name || inc.address || 'Unknown location'}
                  </span>
                </div>
                <IncStatusBadge status={inc.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Metric({ label, value, bar, color }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricTop}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue}>{value}</span>
      </div>
      <div className={styles.barBg}>
        <div
          className={`${styles.barFill} ${styles[`bar_${color}`]}`}
          style={{ width: `${bar}%` }}
        />
      </div>
    </div>
  )
}

function SeverityDot({ severity }) {
  const colorMap = {
    critical: '#ff1744',
    high:     '#ff6d00',
    medium:   '#ffd600',
    low:      '#00e676',
    resolved: '#546e7a',
  }
  return <span className={styles.sevDot} style={{ background: colorMap[severity] || '#546e7a' }} />
}

function IncStatusBadge({ status }) {
  const colorMap = {
    active:      'var(--status-critical)',
    in_progress: 'var(--accent-cyan)',
    resolved:    'var(--status-resolved)',
    pending:     'var(--accent-yellow)',
  }
  return (
    <span className={styles.incStatus} style={{ color: colorMap[status] || 'var(--text-muted)' }}>
      {(status || 'unknown').replace(/_/g,' ').toUpperCase()}
    </span>
  )
}

const TYPE_ICONS = {
  incident: '🚨',
  survivor: '👤',
  team:     '🚁',
  resource: '📦',
  resolved: '✅',
  alert:    '⚠️',
}

const MOCK_ACTIVITY = [
  { id:1, type:'incident', message:'New flood incident reported in Sector 4', ts: new Date(Date.now()-120000), severity:'critical' },
  { id:2, type:'survivor', message:'3 survivors located near Bridge St', ts: new Date(Date.now()-300000), severity:'high' },
  { id:3, type:'team',     message:'Team Alpha dispatched to Zone B', ts: new Date(Date.now()-600000), severity:'medium' },
  { id:4, type:'resource', message:'Medical supplies allocated to Field Hospital', ts: new Date(Date.now()-900000), severity:'low' },
  { id:5, type:'resolved', message:'Incident #23 marked as resolved', ts: new Date(Date.now()-1800000), severity:'resolved' },
  { id:6, type:'incident', message:'Building collapse reported on Oak Ave', ts: new Date(Date.now()-2400000), severity:'critical' },
]

const MOCK_INCIDENTS = [
  { id:1, title:'Flash Flood — River District', type:'Flood', priority:'critical', status:'active', location_name:'River District' },
  { id:2, title:'Building Collapse — Oak Ave', type:'Structural', priority:'critical', status:'in_progress', location_name:'Oak Avenue' },
  { id:3, title:'Gas Leak — Industrial Zone', type:'Hazmat', priority:'high', status:'active', location_name:'Industrial Zone' },
  { id:4, title:'Wildfire — Northern Hills', type:'Fire', priority:'high', status:'in_progress', location_name:'Northern Hills' },
  { id:5, title:'Power Grid Failure — Sector 7', type:'Infrastructure', priority:'medium', status:'pending', location_name:'Sector 7' },
  { id:6, title:'Evacuation Route Blocked', type:'Evacuation', priority:'medium', status:'resolved', location_name:'Highway 9' },
]
