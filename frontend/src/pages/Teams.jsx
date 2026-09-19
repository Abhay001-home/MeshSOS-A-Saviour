import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Button, Table, Modal, StatusBadge, Card, Empty } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Teams.module.css'

const TEAM_TYPES   = ['Search & Rescue','Medical','Fire','Logistics','Hazmat','Evacuation','K9','Dive','Air','Engineering']
const TEAM_STATUSES = ['available','deployed','standby','offline']

const EMPTY_FORM = {
  name:'', type:'Search & Rescue', status:'available',
  leader_name:'', leader_phone:'', member_count:4,
  latitude:'', longitude:'', base_location:'', notes:''
}

export default function Teams() {
  const { teams, fetchTeams, createTeam, loading } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [filterStatus, setFS]     = useState('all')

  useEffect(() => { fetchTeams() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setShowModal(true) }
  const openEdit   = (item) => { setForm({ ...item }); setEditItem(item); setShowModal(true) }
  const set        = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createTeam(form)
      toast.success(editItem ? 'Team updated' : 'Team created')
      setShowModal(false)
    } catch {
      toast.error('Failed to save team')
    } finally { setSaving(false) }
  }

  const filtered = filterStatus === 'all' ? teams : teams.filter(t => t.status === filterStatus)

  const counts = TEAM_STATUSES.reduce((a, s) => ({ ...a, [s]: teams.filter(t => t.status === s).length }), {})

  const columns = [
    { key: 'status', label: 'Status', width: 110, render: (v) => <StatusBadge status={v} /> },
    { key: 'name', label: 'Team / Type', width: 220,
      render: (v, row) => (
        <div>
          <div className={styles.teamName}>{v}</div>
          <div className={styles.teamType}>{row.type}</div>
        </div>
      )
    },
    { key: 'leader_name', label: 'Leader', width: 150,
      render: (v, row) => (
        <div>
          <div className={styles.mono}>{v || '—'}</div>
          {row.leader_phone && <div className={styles.subMono}>{row.leader_phone}</div>}
        </div>
      )
    },
    { key: 'member_count', label: 'Members', width: 80,
      render: (v) => <span className={styles.count}>{v ?? '—'}</span>
    },
    { key: 'base_location', label: 'Base', width: 160,
      render: (v) => <span className={styles.mono}>{v || '—'}</span>
    },
    { key: 'updated_at', label: 'Last Update', width: 130,
      render: (v) => <span className={styles.mono}>{v ? formatDistanceToNow(new Date(v), { addSuffix: true }) : '—'}</span>
    },
    { key: '_actions', label: '', width: 70,
      render: (_, row) => (
        <button className={styles.editBtn} onClick={e => { e.stopPropagation(); openEdit(row) }}>Edit</button>
      )
    }
  ]

  return (
    <div className={styles.page}>
      {/* Status cards */}
      <div className={styles.statusCards}>
        {TEAM_STATUSES.map(st => (
          <button
            key={st}
            className={`${styles.statusCard} ${filterStatus === st ? styles.statusCardActive : ''} ${styles[`sc_${st}`]}`}
            onClick={() => setFS(filterStatus === st ? 'all' : st)}
          >
            <span className={styles.scCount}>{counts[st] || 0}</span>
            <span className={styles.scLabel}>{st.toUpperCase()}</span>
          </button>
        ))}
        <div style={{ flex:1 }} />
        <Button variant="primary" onClick={openCreate} icon={<PlusIcon />}>Create Team</Button>
      </div>

      {/* Map-style team grid */}
      {teams.length > 0 && (
        <div className={styles.teamGrid}>
          {(filterStatus === 'all' ? teams : filtered).slice(0, 8).map(team => (
            <TeamCard key={team.id} team={team} onClick={() => openEdit(team)} />
          ))}
        </div>
      )}

      {/* Full table */}
      <Card className={styles.tableCard}>
        {filtered.length === 0 && !loading.teams ? (
          <Empty icon="👥" title="No teams found" message="Create a response team to get started" action={<Button variant="primary" onClick={openCreate}>Create Team</Button>} />
        ) : (
          <Table columns={columns} data={filtered} loading={loading.teams} onRowClick={openEdit} />
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Team' : 'Create Response Team'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <Field label="TEAM NAME" required>
                <input className={styles.input} value={form.name} onChange={set('name')} placeholder="e.g. Alpha Squad" required />
              </Field>
              <Field label="TYPE">
                <select className={`${styles.input} ${styles.select}`} value={form.type} onChange={set('type')}>
                  {TEAM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="STATUS">
                <select className={`${styles.input} ${styles.select}`} value={form.status} onChange={set('status')}>
                  {TEAM_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="MEMBER COUNT">
                <input type="number" min={1} className={styles.input} value={form.member_count} onChange={set('member_count')} />
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="TEAM LEADER NAME">
                <input className={styles.input} value={form.leader_name || ''} onChange={set('leader_name')} placeholder="Full name" />
              </Field>
              <Field label="LEADER CONTACT">
                <input type="tel" className={styles.input} value={form.leader_phone || ''} onChange={set('leader_phone')} placeholder="+91 XXXXX XXXXX" />
              </Field>
            </div>

            <Field label="BASE / STAGING LOCATION">
              <input className={styles.input} value={form.base_location || ''} onChange={set('base_location')} placeholder="Station name or address" />
            </Field>

            <div className={styles.formRow}>
              <Field label="LATITUDE">
                <input type="number" step="any" className={styles.input} value={form.latitude || ''} onChange={set('latitude')} placeholder="28.5355" />
              </Field>
              <Field label="LONGITUDE">
                <input type="number" step="any" className={styles.input} value={form.longitude || ''} onChange={set('longitude')} placeholder="77.3910" />
              </Field>
            </div>

            <Field label="NOTES">
              <textarea className={`${styles.input} ${styles.textarea}`} rows={2} value={form.notes || ''} onChange={set('notes')} placeholder="Equipment, specializations, notes…" />
            </Field>

            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editItem ? 'Update Team' : 'Create Team'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function TeamCard({ team, onClick }) {
  const statusColor = {
    available: 'var(--accent-green)',
    deployed:  'var(--accent-cyan)',
    standby:   'var(--accent-yellow)',
    offline:   'var(--status-resolved)',
  }
  const color = statusColor[team.status] || 'var(--text-muted)'
  return (
    <div className={styles.teamCard} onClick={onClick} style={{ '--tc': color }}>
      <div className={styles.tcHeader}>
        <div className={styles.tcDot} />
        <span className={styles.tcStatus}>{team.status?.toUpperCase()}</span>
      </div>
      <div className={styles.tcName}>{team.name}</div>
      <div className={styles.tcType}>{team.type}</div>
      <div className={styles.tcMembers}>
        <MembersIcon /> {team.member_count || 0} members
      </div>
      {team.leader_name && <div className={styles.tcLeader}>{team.leader_name}</div>}
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}{required && ' *'}</label>
      {children}
    </div>
  )
}

function MembersIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
