import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { Button, Table, Modal, StatusBadge, Card, Empty } from '../components/ui/index.jsx'
import toast from 'react-hot-toast'
import styles from './Resources.module.css'

const RESOURCE_TYPES = ['Medical Supplies','Food & Water','Rescue Equipment','Vehicles','Communication','Shelter','Power','Tools','Personnel','Other']
const STATUSES       = ['available','allocated','depleted','maintenance']

const EMPTY_FORM = {
  name:'', type:'Medical Supplies', status:'available',
  quantity:1, unit:'units', location:'', notes:'', assigned_to:''
}

export default function Resources() {
  const { resources, fetchResources, loading } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [filterType, setFT]       = useState('all')
  const [filterStatus, setFS]     = useState('all')

  useEffect(() => { fetchResources() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setShowModal(true) }
  const openEdit   = (item) => { setForm({ ...item }); setEditItem(item); setShowModal(true) }
  const set        = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      toast.success(editItem ? 'Resource updated' : 'Resource added')
      setShowModal(false)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const allTypes  = ['all', ...new Set([...RESOURCE_TYPES, ...resources.map(r => r.type).filter(Boolean)])]
  const allStatus = ['all', ...STATUSES]

  const filtered = resources.filter(r => {
    if (filterType   !== 'all' && r.type   !== filterType)   return false
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    return true
  })

  // Summary stats
  const totalItems      = resources.reduce((s, r) => s + (Number(r.quantity) || 0), 0)
  const availableCount  = resources.filter(r => r.status === 'available').length
  const depletedCount   = resources.filter(r => r.status === 'depleted').length

  const columns = [
    { key: 'type', label: 'Type', width: 160,
      render: (v) => <span className={styles.typeTag}>{v}</span>
    },
    { key: 'name', label: 'Resource', width: 220,
      render: (v, row) => (
        <div>
          <div className={styles.resName}>{v}</div>
          {row.notes && <div className={styles.resSub}>{row.notes}</div>}
        </div>
      )
    },
    { key: 'quantity', label: 'Qty', width: 80,
      render: (v, row) => (
        <span className={`${styles.qty} ${Number(v) === 0 ? styles.qtyZero : ''}`}>
          {v} <span className={styles.unit}>{row.unit}</span>
        </span>
      )
    },
    { key: 'status', label: 'Status', width: 120, render: (v) => <StatusBadge status={v} /> },
    { key: 'location', label: 'Location', width: 160,
      render: (v) => <span className={styles.loc}>{v || '—'}</span>
    },
    { key: 'assigned_to', label: 'Assigned To', width: 150,
      render: (v) => <span className={styles.loc}>{v || '—'}</span>
    },
    { key: '_actions', label: '', width: 70,
      render: (_, row) => (
        <button className={styles.editBtn} onClick={e => { e.stopPropagation(); openEdit(row) }}>Edit</button>
      )
    }
  ]

  return (
    <div className={styles.page}>
      {/* Summary bar */}
      <div className={styles.summaryBar}>
        <SumCard label="TOTAL ITEMS" value={resources.length} color="cyan" />
        <SumCard label="TOTAL UNITS" value={totalItems.toLocaleString()} color="cyan" />
        <SumCard label="AVAILABLE"   value={availableCount} color="green" />
        <SumCard label="DEPLETED"    value={depletedCount}  color="alert" />
        <div style={{ flex: 1 }} />
        <Button variant="primary" onClick={openCreate} icon={<PlusIcon />}>Add Resource</Button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>STATUS:</span>
          {allStatus.map(s => (
            <button key={s} className={`${styles.fBtn} ${filterStatus === s ? styles.fBtnActive : ''}`} onClick={() => setFS(s)}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className={styles.tableCard}>
        {filtered.length === 0 && !loading.resources ? (
          <Empty icon="📦" title="No resources found" message="Add resources to your inventory" action={<Button variant="primary" onClick={openCreate}>Add Resource</Button>} />
        ) : (
          <Table columns={columns} data={filtered} loading={loading.resources} onRowClick={openEdit} />
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Resource' : 'Add Resource'} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <Field label="RESOURCE NAME" required>
                <input className={styles.input} value={form.name} onChange={set('name')} placeholder="e.g. First Aid Kit" required />
              </Field>
              <Field label="TYPE">
                <select className={`${styles.input} ${styles.select}`} value={form.type} onChange={set('type')}>
                  {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="QUANTITY">
                <input type="number" min={0} className={styles.input} value={form.quantity} onChange={set('quantity')} />
              </Field>
              <Field label="UNIT">
                <input className={styles.input} value={form.unit || ''} onChange={set('unit')} placeholder="units, kits, liters…" />
              </Field>
              <Field label="STATUS">
                <select className={`${styles.input} ${styles.select}`} value={form.status} onChange={set('status')}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className={styles.formRow}>
              <Field label="STORAGE LOCATION">
                <input className={styles.input} value={form.location || ''} onChange={set('location')} placeholder="Warehouse, vehicle, station…" />
              </Field>
              <Field label="ASSIGNED TO">
                <input className={styles.input} value={form.assigned_to || ''} onChange={set('assigned_to')} placeholder="Team or incident name" />
              </Field>
            </div>

            <Field label="NOTES">
              <textarea className={`${styles.input} ${styles.textarea}`} rows={2} value={form.notes || ''} onChange={set('notes')} placeholder="Expiry, condition, special handling…" />
            </Field>

            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>
                {editItem ? 'Update Resource' : 'Add Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function SumCard({ label, value, color }) {
  return (
    <div className={`${styles.sumCard} ${styles[`sum_${color}`]}`}>
      <span className={styles.sumVal}>{value}</span>
      <span className={styles.sumLabel}>{label}</span>
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
