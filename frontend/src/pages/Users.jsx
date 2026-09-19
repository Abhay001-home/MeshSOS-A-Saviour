import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Card, Table, StatusBadge, Button, Empty, Modal } from '../components/ui/index.jsx'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import styles from './Users.module.css'

const ROLES = ['admin','coordinator','responder','medic','logistics','viewer']

export default function Users() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ name:'', email:'', role:'responder', password:'' })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data.users || data || [])
    } catch {
      // fallback mock
      setUsers(MOCK_USERS)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const openEdit = (user) => { setForm({ ...user, password:'' }); setEditItem(user); setShowModal(true) }
  const openCreate = () => { setForm({ name:'', email:'', role:'responder', password:'' }); setEditItem(null); setShowModal(true) }
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editItem) {
        await api.patch(`/users/${editItem.id}`, form)
        toast.success('User updated')
      } else {
        await api.post('/users', form)
        toast.success('User created')
      }
      fetchUsers()
      setShowModal(false)
    } catch { toast.error('Failed to save user') }
    finally { setSaving(false) }
  }

  const handleDeactivate = async (user) => {
    if (!confirm(`Deactivate ${user.name}?`)) return
    try {
      await api.patch(`/users/${user.id}`, { active: false })
      toast.success('User deactivated')
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  const columns = [
    { key: 'name', label: 'Name', width: 200,
      render: (v, row) => (
        <div>
          <div className={styles.name}>{v}</div>
          <div className={styles.email}>{row.email}</div>
        </div>
      )
    },
    { key: 'role', label: 'Role', width: 130,
      render: (v) => <span className={styles.roleTag}>{v?.toUpperCase()}</span>
    },
    { key: 'active', label: 'Status', width: 100,
      render: (v) => <StatusBadge status={v === false ? 'offline' : 'active'} />
    },
    { key: 'last_login', label: 'Last Active', width: 150,
      render: (v) => <span className={styles.mono}>{v ? formatDistanceToNow(new Date(v), { addSuffix: true }) : 'Never'}</span>
    },
    { key: 'created_at', label: 'Joined', width: 130,
      render: (v) => <span className={styles.mono}>{v ? formatDistanceToNow(new Date(v), { addSuffix: true }) : '—'}</span>
    },
    { key: '_actions', label: '', width: 120,
      render: (_, row) => (
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={e => { e.stopPropagation(); openEdit(row) }}>Edit</button>
          <button className={`${styles.editBtn} ${styles.dangerBtn}`} onClick={e => { e.stopPropagation(); handleDeactivate(row) }}>Deactivate</button>
        </div>
      )
    }
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.total}>{users.length} registered operators</div>
          <div className={styles.active}>{users.filter(u => u.active !== false).length} active</div>
        </div>
        <Button variant="primary" onClick={openCreate} icon={<PlusIcon />}>Add User</Button>
      </div>

      <Card className={styles.tableCard}>
        {users.length === 0 && !loading ? (
          <Empty icon="👥" title="No users found" action={<Button variant="primary" onClick={openCreate}>Add User</Button>} />
        ) : (
          <Table columns={columns} data={users} loading={loading} onRowClick={openEdit} />
        )}
      </Card>

      {showModal && (
        <Modal title={editItem ? 'Edit User' : 'Add User'} onClose={() => setShowModal(false)} size="md">
          <form onSubmit={handleSubmit} className={styles.form}>
            <Field label="FULL NAME" required>
              <input className={styles.input} value={form.name} onChange={set('name')} placeholder="Full name" required />
            </Field>
            <Field label="EMAIL" required>
              <input type="email" className={styles.input} value={form.email} onChange={set('email')} placeholder="user@response.gov" required />
            </Field>
            <Field label="ROLE">
              <select className={`${styles.input} ${styles.select}`} value={form.role} onChange={set('role')}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label={editItem ? 'NEW PASSWORD (leave blank to keep)' : 'PASSWORD'}>
              <input type="password" className={styles.input} value={form.password} onChange={set('password')} placeholder="••••••••" minLength={editItem ? 0 : 6} required={!editItem} />
            </Field>
            <div className={styles.formActions}>
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={saving}>{editItem ? 'Update' : 'Create User'}</Button>
            </div>
          </form>
        </Modal>
      )}
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

const MOCK_USERS = [
  { id:1, name:'Admin User', email:'admin@hyperrescue.local', role:'admin', active:true, created_at: new Date(Date.now()-86400000*30) },
  { id:2, name:'Field Coordinator', email:'coord@hyperrescue.local', role:'coordinator', active:true, last_login: new Date(Date.now()-3600000) },
  { id:3, name:'Dr. Meera Singh', email:'meera@hyperrescue.local', role:'medic', active:true, last_login: new Date(Date.now()-7200000) },
  { id:4, name:'Ravi Kumar', email:'ravi@hyperrescue.local', role:'responder', active:true, last_login: new Date(Date.now()-1800000) },
]
