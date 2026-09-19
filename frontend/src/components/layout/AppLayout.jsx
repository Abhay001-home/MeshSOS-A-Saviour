import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useSocket } from '../../hooks/useSocket'
import { connectSocket } from '../../lib/socket'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  useSocket()

  useEffect(() => {
    connectSocket()

    // Live clock in sidebar
    const el = document.getElementById('clock')
    const tick = setInterval(() => {
      if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false })
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Header />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
