import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Button, Table, Modal, PriorityBadge, StatusBadge, Card, Empty } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Incidents.module.css'

const INCIDENT_TYPES = ['Flood','Fire','Earthquake','Landslide','Building Collapse','Hazmat','Evacuation','Medical','Infrastructure','Other']
const PRIORITIES     = ['critical','high','medium','low']
const STATUSES       = ['active','in_progress','pending','resolved']

const EMPTY_FORM = {
  title:'', type:'Flood', priority:'high', status:'active',
  latitude:'', longitude:'', address:'', description:'',
  affected_count:0
}

export default function Incidents() {
  const { incidents, fetchIncidents, createIncident, updateIncident, deleteIncident, loading } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [filterStatus,   setFS]   = useState('all')
  const [filterPriority, setFP]   = useState('all')

  useEffect(() => { fetchIncidents() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setShowModal(true) }
  const openEdit   = (item) => { setForm({ ...item }); setEditItem(item); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await updateIncident(editItem.id, form)
        toast.success('Incident updated')
      } else {
        await createIncident(form)
        toast.success('Incident reported')
      }
      setShowModal(false)
    } catch {
      toast.error('Failed to save incident')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete incident "${item.title}"?`)) return
    try {
      await deleteIncident(item.id)
      toast.success('Incident deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = incidents.filter(i => {
    if (filterStatus   !== 'all' && i.status   !== filterStatus)   return false
    if (filterPriority !== 'all' && i.priority  !== filterPriority) return false
    return true
  })

  const columns = [
    { key:'priority', label:'Priority', width:100,
      render: (v) => <PriorityBadge priority={v} /> },
    { key:'title',    label:'Title', width:240,
      render: (v, row) => (
        <div>
          <div className={styles.incTitle}>{v}</div>
          <div className={styles.incMeta}>{row.type} · {row.address || '—'}</div>
        </div>
      )},
    { key:'status',   label:'Status',   width:120, render: (v) => <StatusBadge status={v} /> },
    { key:'affected_count', label:'Affected', width:80,
      render: (v) => <span className={styles.mono}>{v ?? 0}</span> },
    { key:'created_at', label:'Reported', width:140,
      render: (v) => <span className={styles.mono}>{v ? formatDistanceToNow(new Date(v), { addSuffix:true }) : '—'}</span> },
    { key:'_actions',  label:'', width:100,
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.actBtn} onClick={(e)=>{ e.stopPropagation(); openEdit(row) }}>Edit</button>
          <button className={`${styles.actBtn} ${styles.actBtnDanger}`} onClick={(e)=>{ e.stopPropagation(); handleDelete(row) }}>Del</button>
        </div>
      )},
  ]

  const criticalCount = incidents.filter(i => i.priority==='critical' && i.status!=='resolved').length
  const activeCount   = incidents.filter(i => i.status==='active').length

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageStats}>
          {criticalCount > 0 && (
            <div className={styles.criticalAlert}>
              <span className={styles.critDot} />
              {criticalCount} CRITICAL INCIDENT{criticalCount > 1 ? 'S' : ''} ACTIVE
            </div>
          )}
          <span className={styles.totalCount}>{incidents.length} total · {activeCount} active</span>
        </div>
        <Button variant="primary" onClick={openCreate} icon={<PlusIcon />}>
          Report Incident
        </Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <FilterGroup label="Status" value={filterStatus} onChange={setFS}
          options={[{v:'all',l:'All'}, ...STATUSES.map(s=>({v:s,l:s.replace(/_/g,' ')}))]} />
        <FilterGroup label="Priority" value={filterPriority} onChange={setFP}
          options={[{v:'all',l:'All'}, ...PRIORITIES.map(p=>({v:p,l:p}))]} />
        <div className={styles.filterCount}>{filtered.length} results</div>
      </div>

      {/* Table or empty */}
      <Card className={styles.tableCard}>
        {filtered.length === 0 && !loading.incidents ? (
          <Empty icon="🚨" title="No incidents found" message="Report a new incident or adjust your filters" action={<Button variant="primary" onClick={openCreate}>Report Incident</Button>} />
        ) : (
          <Table
            columns={columns}
            data={filtered}
            loading={loading.incidents}
            onRowClick={openEdit}
          />
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Incident' : 'Report Incident'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <Field label="TITLE" required>
                <input className={styles.input} value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Brief incident title" required />
              </Field>
              <Field label="TYPE">
                <select className={styles.select} value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                  {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className={styles.formRow}>
              <Field label="PRIORITY">
                <select className={styles.select} value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="STATUS">
                <select className={styles.select} value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="AFFECTED COUNT">
                <input type="number" className={styles.input} value={form.affected_count} min={0} onChange={e => setForm(f=>({...f,affected_count:Number(e.target.value)}))} />
              </Field>
            </div>
            <Field label="ADDRESS / LOCATION NAME">
              <input className={styles.input} value={form.address || ''} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Street address or zone name" />
            </Field>
            <div className={styles.formRow}>
              <Field label="LATITUDE">
                <input type="number" step="any" className={styles.input} value={form.latitude||''} onChange={e => setForm(f=>({...f,latitude:e.target.value}))} placeholder="28.5355" />
              </Field>
              <Field label="LONGITUDE">
                <input type="number" step="any" className={styles.input} value={form.longitude||''} onChange={e => setForm(f=>({...f,longitude:e.target.value}))} placeholder="77.3910" />
              </Field>
            </div>
            <Field label="DESCRIPTION">
              <textarea className={`${styles.input} ${styles.textarea}`} value={form.description||''} rows={3} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Detailed description of the incident..." />
            </Field>
            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editItem ? 'Update Incident' : 'Report Incident'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function FilterGroup({ label, value, onChange, options }) {
  return (
    <div className={styles.filterGroup}>
      <span className={styles.filterLabel}>{label}:</span>
      <div className={styles.filterBtns}>
        {options.map(o => (
          <button
            key={o.v}
            className={`${styles.filterBtn} ${value === o.v ? styles.filterBtnActive : ''}`}
            onClick={() => onChange(o.v)}
          >
            {o.l.toUpperCase()}
          </button>
        ))}
      </div>
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

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
