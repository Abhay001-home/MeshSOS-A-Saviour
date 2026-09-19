import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Button, Card } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'
import styles from './Settings.module.css'

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setTab] = useState('profile')

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Sidebar tabs */}
        <div className={styles.tabList}>
          {TABS.map(t => (
            <button key={t.id} className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
              <span className={styles.tabIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'profile'   && <ProfileSettings user={user} />}
          {activeTab === 'system'    && <SystemSettings />}
          {activeTab === 'alerts'    && <AlertSettings />}
          {activeTab === 'mapbox'    && <MapboxSettings />}
          {activeTab === 'about'     && <AboutPanel />}
        </div>
      </div>
    </div>
  )
}

function ProfileSettings({ user }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const save = () => toast.success('Profile saved')

  return (
    <Section title="Profile" sub="Update your personal information">
      <div className={styles.fieldGrid}>
        <Field label="FULL NAME">
          <input className={styles.input} value={form.name} onChange={set('name')} />
        </Field>
        <Field label="EMAIL ADDRESS">
          <input type="email" className={styles.input} value={form.email} onChange={set('email')} />
        </Field>
        <Field label="PHONE NUMBER">
          <input type="tel" className={styles.input} value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" />
        </Field>
        <Field label="ROLE">
          <input className={styles.input} value={user?.role?.toUpperCase() || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
        </Field>
      </div>
      <SaveBtn onClick={save} />
    </Section>
  )
}

function SystemSettings() {
  const [settings, setS] = useState({ auto_assign: true, notify_critical: true, offline_mode: false, data_sync_interval: 30 })
  const toggle = (k) => setS(s => ({ ...s, [k]: !s[k] }))
  const save = () => toast.success('System settings saved')

  return (
    <Section title="System" sub="Core operational settings">
      <div className={styles.settingsList}>
        <Toggle label="Auto-assign incidents to nearest team" sub="Uses GPS proximity to auto-dispatch" value={settings.auto_assign} onChange={() => toggle('auto_assign')} />
        <Toggle label="Alert on critical incidents" sub="Push notifications for priority = critical" value={settings.notify_critical} onChange={() => toggle('notify_critical')} />
        <Toggle label="Offline mode support" sub="Cache data locally for field use without internet" value={settings.offline_mode} onChange={() => toggle('offline_mode')} />
        <Field label="DATA SYNC INTERVAL (seconds)">
          <input type="number" min={10} max={300} className={styles.input} style={{ maxWidth: 140 }}
            value={settings.data_sync_interval}
            onChange={e => setS(s => ({ ...s, data_sync_interval: Number(e.target.value) }))}
          />
        </Field>
      </div>
      <SaveBtn onClick={save} />
    </Section>
  )
}

function AlertSettings() {
  const [settings, setS] = useState({ sound: true, desktop: true, email: false, sms: false, threshold: 'high' })
  const toggle = (k) => setS(s => ({ ...s, [k]: !s[k] }))
  const save = () => toast.success('Alert preferences saved')

  return (
    <Section title="Alert Preferences" sub="Control how you receive notifications">
      <div className={styles.settingsList}>
        <Toggle label="Sound alerts" sub="Play audio on critical events" value={settings.sound} onChange={() => toggle('sound')} />
        <Toggle label="Desktop notifications" sub="Browser push notifications" value={settings.desktop} onChange={() => toggle('desktop')} />
        <Toggle label="Email notifications" sub="Send digest to your registered email" value={settings.email} onChange={() => toggle('email')} />
        <Toggle label="SMS alerts" sub="Requires Twilio integration" value={settings.sms} onChange={() => toggle('sms')} />
        <Field label="MINIMUM PRIORITY TO ALERT">
          <select className={`${styles.input} ${styles.select}`} value={settings.threshold} onChange={e => setS(s => ({ ...s, threshold: e.target.value }))} style={{ maxWidth: 200 }}>
            <option value="critical">Critical only</option>
            <option value="high">High and above</option>
            <option value="medium">Medium and above</option>
            <option value="low">All incidents</option>
          </select>
        </Field>
      </div>
      <SaveBtn onClick={save} />
    </Section>
  )
}

function MapboxSettings() {
  const [token, setToken] = useState(import.meta.env.VITE_MAPBOX_TOKEN || '')
  const [center, setCenter] = useState({ lat: '28.5355', lng: '77.3910' })
  const save = () => toast.success('Map settings saved — restart required')

  return (
    <Section title="Map Configuration" sub="Mapbox GL JS integration settings">
      <div className={styles.fieldGrid}>
        <Field label="MAPBOX ACCESS TOKEN" style={{ gridColumn: '1 / -1' }}>
          <input type="password" className={styles.input} value={token} onChange={e => setToken(e.target.value)}
            placeholder="pk.eyJ1Ij..." />
          <div className={styles.fieldHint}>Get your token at <a href="https://account.mapbox.com" target="_blank" rel="noreferrer">account.mapbox.com</a></div>
        </Field>
        <Field label="DEFAULT LATITUDE">
          <input type="number" step="any" className={styles.input} value={center.lat} onChange={e => setCenter(c => ({ ...c, lat: e.target.value }))} />
        </Field>
        <Field label="DEFAULT LONGITUDE">
          <input type="number" step="any" className={styles.input} value={center.lng} onChange={e => setCenter(c => ({ ...c, lng: e.target.value }))} />
        </Field>
      </div>
      <div className={styles.tokenNote}>
        ⓘ Token is stored in <code>.env</code> as <code>VITE_MAPBOX_TOKEN</code>. Changes here are local to this session only.
      </div>
      <SaveBtn onClick={save} />
    </Section>
  )
}

function AboutPanel() {
  return (
    <Section title="About HyperRescue" sub="System information">
      <div className={styles.aboutGrid}>
        <InfoRow label="Version" value="1.0.0-alpha" />
        <InfoRow label="Frontend" value="React 19 + Vite 6" />
        <InfoRow label="Backend" value="Node.js + Express + PostgreSQL" />
        <InfoRow label="Real-time" value="Socket.IO" />
        <InfoRow label="Maps" value="Mapbox GL JS v3" />
        <InfoRow label="Mobile" value="React Native + Bridgefy BLE (planned)" />
        <InfoRow label="License" value="MIT" />
      </div>
      <div className={styles.buildStamp}>
        Built for disaster resilience. Every second matters.
      </div>
    </Section>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <Card className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {sub && <div className={styles.sectionSub}>{sub}</div>}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </Card>
  )
}

function Field({ label, children, style }) {
  return (
    <div className={styles.field} style={style}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleText}>
        <div className={styles.toggleLabel}>{label}</div>
        {sub && <div className={styles.toggleSub}>{sub}</div>}
      </div>
      <button className={`${styles.toggle} ${value ? styles.toggleOn : ''}`} onClick={onChange} type="button">
        <span className={styles.toggleThumb} />
      </button>
    </div>
  )
}

function SaveBtn({ onClick }) {
  return (
    <div className={styles.saveRow}>
      <Button variant="primary" onClick={onClick}>Save Changes</Button>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  )
}

const TABS = [
  { id: 'profile',  icon: '👤', label: 'Profile' },
  { id: 'system',   icon: '⚙️', label: 'System' },
  { id: 'alerts',   icon: '🔔', label: 'Alerts' },
  { id: 'mapbox',   icon: '🗺️', label: 'Map Config' },
  { id: 'about',    icon: 'ℹ️', label: 'About' },
]
