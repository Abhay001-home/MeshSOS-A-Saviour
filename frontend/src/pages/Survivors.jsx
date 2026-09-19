import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Button, Table, Modal, StatusBadge, Card, Empty, PriorityBadge } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Survivors.module.css'

const STATUSES    = ['missing','found','critical','rescued','deceased']
const CONDITIONS  = ['stable','serious','critical','unknown']
const NEEDS       = ['Medical','Food','Water','Shelter','Evacuation','None']

const EMPTY_FORM = {
  name:'', age:'', gender:'male', status:'missing',
  medical_condition:'unknown', needs:'None',
  latitude:'', longitude:'', address:'', notes:'',
  contact_name:'', contact_phone:'',
}

export default function Survivors() {
  const { survivors, fetchSurvivors, createSurvivor, updateSurvivor, loading } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [filterStatus, setFS]     = useState('all')
  const [search, setSearch]       = useState('')

  useEffect(() => { fetchSurvivors() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setShowModal(true) }
  const openEdit   = (item) => { setForm({ ...item }); setEditItem(item); setShowModal(true) }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await updateSurvivor(editItem.id, form)
        toast.success('Survivor record updated')
      } else {
        await createSurvivor(form)
        toast.success('Survivor logged')
      }
      setShowModal(false)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const filtered = survivors.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    if (search && !`${s.name}${s.address}${s.notes}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Summary counts
  const counts = STATUSES.reduce((acc, st) => {
    acc[st] = survivors.filter(s => s.status === st).length
    return acc
  }, {})

  const columns = [
    { key: 'status', label: 'Status', width: 110, render: (v) => <StatusBadge status={v} /> },
    { key: 'name', label: 'Name / Info', width: 200,
      render: (v, row) => (
        <div>
          <div className={styles.nameCell}>{v || 'Unknown'}</div>
          <div className={styles.metaCell}>
            {row.age ? `Age ${row.age}` : ''}
            {row.age && row.gender ? ' · ' : ''}
            {row.gender || ''}
          </div>
        </div>
      )
    },
    { key: 'medical_condition', label: 'Condition', width: 110,
      render: (v) => {
        const color = { critical:'var(--status-critical)', serious:'var(--status-high)', stable:'var(--accent-green)', unknown:'var(--text-muted)' }
        return <span style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color: color[v] || 'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{v || '—'}</span>
      }
    },
    { key: 'needs', label: 'Needs', width: 100, render: (v) => <span className={styles.mono}>{v || '—'}</span> },
    { key: 'address', label: 'Location', width: 180, render: (v) => <span className={styles.addr}>{v || '—'}</span> },
    { key: 'created_at', label: 'Logged', width: 130,
      render: (v) => <span className={styles.mono}>{v ? formatDistanceToNow(new Date(v), { addSuffix: true }) : '—'}</span>
    },
    { key: '_actions', label: '', width: 70,
      render: (_, row) => (
        <button className={styles.editBtn} onClick={e => { e.stopPropagation(); openEdit(row) }}>Edit</button>
      )
    },
  ]

  return (
    <div className={styles.page}>
      {/* Status summary strip */}
      <div className={styles.summaryStrip}>
        {STATUSES.map(st => (
          <button
            key={st}
            className={`${styles.summaryChip} ${filterStatus === st ? styles.summaryChipActive : ''} ${styles[`chip_${st}`]}`}
            onClick={() => setFS(filterStatus === st ? 'all' : st)}
          >
            <span className={styles.chipCount}>{counts[st] || 0}</span>
            <span className={styles.chipLabel}>{st.toUpperCase()}</span>
          </button>
        ))}
        <div className={styles.summaryTotal}>{survivors.length} total</div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Search by name, location, notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {filterStatus !== 'all' && (
          <button className={styles.clearFilter} onClick={() => setFS('all')}>
            ✕ {filterStatus}
          </button>
        )}
        <div style={{ flex:1 }} />
        <Button variant="primary" onClick={openCreate} icon={<PlusIcon />}>Log Survivor</Button>
      </div>

      {/* Table */}
      <Card className={styles.tableCard}>
        {filtered.length === 0 && !loading.survivors ? (
          <Empty icon="👤" title="No survivors found" message="Log a new survivor or adjust your search" action={<Button variant="primary" onClick={openCreate}>Log Survivor</Button>} />
        ) : (
          <Table columns={columns} data={filtered} loading={loading.survivors} onRowClick={openEdit} />
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? 'Update Survivor Record' : 'Log New Survivor'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <Field label="FULL NAME">
                <input className={styles.input} value={form.name} onChange={set('name')} placeholder="Name or 'Unknown'" />
              </Field>
              <Field label="AGE">
                <input type="number" min={0} max={120} className={styles.input} value={form.age || ''} onChange={set('age')} placeholder="—" />
              </Field>
              <Field label="GENDER">
                <select className={`${styles.input} ${styles.select}`} value={form.gender} onChange={set('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="STATUS">
                <select className={`${styles.input} ${styles.select}`} value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="MEDICAL CONDITION">
                <select className={`${styles.input} ${styles.select}`} value={form.medical_condition} onChange={set('medical_condition')}>
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="IMMEDIATE NEEDS">
                <select className={`${styles.input} ${styles.select}`} value={form.needs} onChange={set('needs')}>
                  {NEEDS.map(n => <option key={n}>{n}</option>)}
                </select>
              </Field>
            </div>

            <Field label="LOCATION / ADDRESS">
              <input className={styles.input} value={form.address || ''} onChange={set('address')} placeholder="Street, zone, landmark…" />
            </Field>

            <div className={styles.formRow}>
              <Field label="LATITUDE">
                <input type="number" step="any" className={styles.input} value={form.latitude || ''} onChange={set('latitude')} placeholder="28.5355" />
              </Field>
              <Field label="LONGITUDE">
                <input type="number" step="any" className={styles.input} value={form.longitude || ''} onChange={set('longitude')} placeholder="77.3910" />
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="EMERGENCY CONTACT NAME">
                <input className={styles.input} value={form.contact_name || ''} onChange={set('contact_name')} placeholder="Relative or caretaker" />
              </Field>
              <Field label="CONTACT PHONE">
                <input type="tel" className={styles.input} value={form.contact_phone || ''} onChange={set('contact_phone')} placeholder="+91 XXXXX XXXXX" />
              </Field>
            </div>

            <Field label="NOTES / OBSERVATIONS">
              <textarea className={`${styles.input} ${styles.textarea}`} rows={3} value={form.notes || ''} onChange={set('notes')} placeholder="Any additional observations…" />
            </Field>

            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="cyan" loading={saving}>
                {editItem ? 'Update Record' : 'Log Survivor'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  )
}

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
