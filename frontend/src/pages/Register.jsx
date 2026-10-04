import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/index.jsx'
import styles from './Login.module.css'
import rStyles from './Register.module.css'

const ROLES = [
  { value: 'responder',    label: 'Field Responder' },
  { value: 'coordinator',  label: 'Operations Coordinator' },
  { value: 'medic',        label: 'Medical Personnel' },
  { value: 'logistics',    label: 'Logistics Officer' },
]

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'responder' })
  const { register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => {
    clearError()
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form)
    if (result.ok) navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>⬡</div>
          <div>
            <div className={styles.brandName}>MeshSOS</div>
            <div className={styles.brandTagline}>Operator Registration</div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Create Account</div>
            <div className={styles.cardSub}>Register as a response operator</div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>FULL NAME</label>
              <input className={styles.input} placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>EMAIL</label>
              <input type="email" className={styles.input} placeholder="ops@response.gov" value={form.email} onChange={set('email')} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>PASSWORD</label>
              <input type="password" className={styles.input} placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>ROLE</label>
              <select className={`${styles.input} ${rStyles.select}`} value={form.role} onChange={set('role')}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {error && <div className={styles.errorMsg}><span>⚠</span> {error}</div>}

            <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className={styles.footer}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
