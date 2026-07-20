import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import ThemeToggle from '../components/ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/skills', label: 'Skills' },
  { to: '/admin/experience', label: 'Experience' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/profile', label: 'Profile Settings' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  function closeSidebar() {
    setIsSidebarOpen(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside
        id="admin-sidebar-nav"
        className={isSidebarOpen ? 'admin-sidebar is-open' : 'admin-sidebar'}
      >
        <div className="admin-sidebar-brand">Patrick Torres</div>
        <nav className="admin-sidebar-nav" aria-label="Admin">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-sidebar-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </aside>

      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-expanded={isSidebarOpen}
              aria-controls="admin-sidebar-nav"
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
              <span />
            </button>
            <a href="/" className="admin-topbar-link">
              View Site
            </a>
          </div>
          <ThemeToggle />
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
