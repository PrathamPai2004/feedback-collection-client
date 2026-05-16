import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <i className="fas fa-comments-alt" />
          <span>FeedbackFlow</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <i className="fas fa-chart-pie" /> Dashboard
          </NavLink>
          <NavLink to="/forms" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <i className="fas fa-wpforms" /> Forms
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="nav-item btn-ghost" style={{ width: '100%', marginTop: '0.4rem' }} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
