import styles from './UI.module.css'

// ── Button ────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, disabled, icon, onClick, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className={styles.spinner} />}
      {!loading && icon && <span className={styles.btnIcon}>{icon}</span>}
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────
export function Badge({ children, variant = 'default', size = 'sm', pulse }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${variant}`]} ${styles[`badge_${size}`]} ${pulse ? styles.badgePulse : ''}`}>
      {pulse && <span className={styles.badgeDot} />}
      {children}
    </span>
  )
}

// Priority / Status helpers
export function PriorityBadge({ priority }) {
  const map = {
    critical: 'critical',
    high:     'high',
    medium:   'medium',
    low:      'low',
  }
  return <Badge variant={map[priority] || 'default'} pulse={priority === 'critical'}>{priority?.toUpperCase()}</Badge>
}

export function StatusBadge({ status }) {
  const map = {
    active:     'active',
    resolved:   'resolved',
    pending:    'pending',
    in_progress:'inprogress',
    rescued:    'active',
    missing:    'high',
    critical:   'critical',
    available:  'active',
    deployed:   'inprogress',
    offline:    'resolved',
  }
  return <Badge variant={map[status] || 'default'}>{status?.replace(/_/g,' ').toUpperCase()}</Badge>
}

// ── Card ──────────────────────────────────────
export function Card({ children, className = '', glow, onClick }) {
  return (
    <div
      className={`${styles.card} ${glow ? styles.cardGlow : ''} ${onClick ? styles.cardClickable : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────
export function StatCard({ label, value, sub, color = 'cyan', icon, trend }) {
  return (
    <div className={`${styles.statCard} ${styles[`stat_${color}`]}`}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        {icon && <span className={styles.statIcon}>{icon}</span>}
      </div>
      <div className={styles.statValue}>{value ?? '—'}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
      {trend !== undefined && (
        <div className={`${styles.statTrend} ${trend >= 0 ? styles.trendUp : styles.trendDown}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

// ── Table ─────────────────────────────────────
export function Table({ columns, data, onRowClick, loading, emptyMessage = 'No data' }) {
  if (loading) return <div className={styles.tableLoading}><Spinner /><span>Loading...</span></div>

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={styles.th} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className={styles.tdEmpty}>{emptyMessage}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`${styles.tr} ${onRowClick ? styles.trClickable : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className={styles.td}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Spinner ───────────────────────────────────
export function Spinner({ size = 24, color }) {
  return (
    <svg
      className={styles.spinnerSvg}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: color || 'var(--accent-cyan)' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ── Modal ─────────────────────────────────────
export function Modal({ title, children, onClose, size = 'md' }) {
  return (
    <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`${styles.modal} ${styles[`modal_${size}`]}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────
export function Empty({ icon, title, message, action }) {
  return (
    <div className={styles.empty}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <div className={styles.emptyTitle}>{title}</div>
      {message && <div className={styles.emptyMsg}>{message}</div>}
      {action}
    </div>
  )
}
