import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/index.jsx'
import styles from './Login.module.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const set = (k) => (e) => {
    clearError()
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form)
    if (result.ok) navigate('/dashboard')
  }

  return (
    <div className={styles.page}>
      {/* Ambient background */}
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>⬡</div>
          <div>
            <div className={styles.brandName}>MeshSOS</div>
            <div className={styles.brandTagline}>MeshSOS Response Coordinator</div>
          </div>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Operator Access</div>
            <div className={styles.cardSub}>Authenticate to enter command center</div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                className={styles.input}
                placeholder="ops@response.gov"
                value={form.email}
                onChange={set('email')}
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>PASSWORD</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
              />
            </div>

            {error && (
              <div className={styles.errorMsg}>
                <span>⚠</span> {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
              {loading ? 'Authenticating...' : 'Enter Command Center'}
            </Button>
          </form>

          <div className={styles.footer}>
            No account?{' '}
            <Link to="/register">Register as operator</Link>
          </div>

          {/* Demo credentials */}
          <div className={styles.demo}>
            <div className={styles.demoLabel}>DEMO CREDENTIALS</div>
            <button
              type="button"
              className={styles.demoFill}
              onClick={() => setForm({ email: 'admin@hyperrescue.local', password: 'admin123' })}
            >
              admin@hyperrescue.local / admin123
            </button>
          </div>
        </div>

        {/* Status strip */}
        <div className={styles.statusStrip}>
          <span className={styles.statusDot} />
          <span>All systems operational</span>
          <span className={styles.sep}>·</span>
          <span>v1.0.0-alpha</span>
        </div>
      </div>
    </div>
  )
}
