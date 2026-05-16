import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin  = user?.role === 'admin' || user?.role === 'moderator'

  const [stats, setStats]   = useState(null)
  const [forms, setForms]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calls = [axios.get('/forms')]
    if (isAdmin) calls.push(axios.get('/analytics/overview'))

    Promise.all(calls)
      .then(([f, s]) => {
        setForms(f.data.forms || [])
        if (s) setStats(s.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAdmin])

  if (loading) return (
    <div className="page">
      <div className="full-loader" style={{ minHeight: '60vh' }}><div className="spinner-lg" /></div>
    </div>
  )

  /* ─── Regular user dashboard ─── */
  if (!isAdmin) {
    const active = forms.filter(f => f.isActive)
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here are the feedback forms available for you</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><i className="fas fa-wpforms" /></div>
            <div><div className="stat-val">{active.length}</div><div className="stat-label">Forms Available</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-paper-plane" /></div>
            <div><div className="stat-val">—</div><div className="stat-label">Your Submissions</div></div>
          </div>
        </div>

        {active.length === 0 ? (
          <div className="card">
            <div className="empty"><i className="fas fa-clipboard" /><p>No active forms at the moment. Check back later!</p></div>
          </div>
        ) : (
          <div className="form-cards-grid">
            {active.map(f => (
              <div className="form-card" key={f._id}>
                <div className="form-card-icon"><i className="fas fa-wpforms" /></div>
                <div className="form-card-body">
                  <h3>{f.title}</h3>
                  {f.description && <p>{f.description}</p>}
                  <div className="form-card-meta">
                    <span><i className="fas fa-list" /> {f.fields?.length ?? 0} fields</span>
                  </div>
                </div>
                <Link to={`/f/${f.slug}`} className="btn btn-primary" id={`fill-form-${f._id}`}>
                  <i className="fas fa-paper-plane" /> Fill Form
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ─── Admin dashboard ─── */
  const cards = [
    { icon: 'fa-wpforms',  cls: 'purple', val: stats?.totalForms     ?? 0,  label: 'Total Forms' },
    { icon: 'fa-inbox',    cls: 'green',  val: stats?.totalResponses ?? 0,  label: 'Total Responses' },
    { icon: 'fa-star',     cls: 'yellow', val: stats?.avgRating ? stats.avgRating.toFixed(1) : '—', label: 'Avg Rating' },
    { icon: 'fa-smile',    cls: 'blue',   val: stats?.positivePct ? `${stats.positivePct}%` : '—',  label: 'Positive Sentiment' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your feedback collection activity</p>
        </div>
        <Link to="/forms" className="btn btn-primary"><i className="fas fa-plus" /> New Form</Link>
      </div>

      <div className="stats-grid">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className={`stat-icon ${c.cls}`}><i className={`fas ${c.icon}`} /></div>
            <div><div className="stat-val">{c.val}</div><div className="stat-label">{c.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Forms</h3>
          <Link to="/forms" className="btn btn-ghost btn-sm">View all</Link>
        </div>
        {forms.length === 0 ? (
          <div className="empty"><i className="fas fa-folder-open" /><p>No forms yet. Create your first form!</p></div>
        ) : (
          <table>
            <thead>
              <tr><th>Form Name</th><th>Responses</th><th>Status</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {forms.slice(0, 5).map(f => (
                <tr key={f._id}>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{f.title}</td>
                  <td>{f.responseCount ?? 0}</td>
                  <td><span className={`badge badge-${f.isActive ? 'green' : 'gray'}`}>{f.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td><Link to={`/forms/${f._id}/feedback`} className="btn btn-ghost btn-sm"><i className="fas fa-eye" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
