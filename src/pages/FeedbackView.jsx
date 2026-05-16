import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function FeedbackView() {
  const { id } = useParams()
  const [formData, setFormData]   = useState(null)
  const [responses, setResponses] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('responses')
  const [page, setPage]           = useState(1)
  const [total, setTotal]         = useState(0)
  const PER_PAGE = 10

  useEffect(() => {
    Promise.all([
      axios.get(`/forms/${id}`),
      axios.get(`/feedback/${id}?page=${page}&limit=${PER_PAGE}`),
      axios.get(`/analytics/form/${id}`)
    ]).then(([f, fb, an]) => {
      setFormData(f.data.form)
      setResponses(fb.data.responses || [])
      setTotal(fb.data.total || 0)
      setAnalytics(an.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [id, page])

  if (loading) return <div className="page"><div className="full-loader" style={{ minHeight:'60vh' }}><div className="spinner-lg" /></div></div>

  const sentimentCls = s => s === 'positive' ? 'positive' : s === 'negative' ? 'negative' : 'neutral'

  const ratingDist = analytics?.ratingDistribution || {}
  const maxCount = Math.max(...Object.values(ratingDist), 1)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ marginBottom: '0.3rem' }}>
            <Link to="/forms" style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>
              <i className="fas fa-arrow-left" /> Back to Forms
            </Link>
          </div>
          <h1>{formData?.title}</h1>
          <p>{formData?.description}</p>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { icon: 'fa-inbox', cls: 'purple', val: total, label: 'Total Responses' },
          { icon: 'fa-star', cls: 'yellow', val: analytics?.avgRating ? analytics.avgRating.toFixed(1) : '—', label: 'Avg Rating' },
          { icon: 'fa-smile', cls: 'green', val: analytics?.positivePct ? `${analytics.positivePct}%` : '—', label: 'Positive' },
          { icon: 'fa-frown', cls: 'blue', val: analytics?.negativePct ? `${analytics.negativePct}%` : '—', label: 'Negative' },
        ].map(c => (
          <div className="stat-card" key={c.label}>
            <div className={`stat-icon ${c.cls}`}><i className={`fas ${c.icon}`} /></div>
            <div><div className="stat-val">{c.val}</div><div className="stat-label">{c.label}</div></div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        <button className={`tab${tab === 'responses' ? ' active' : ''}`} onClick={() => setTab('responses')}>Responses</button>
        <button className={`tab${tab === 'analytics' ? ' active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
      </div>

      {/* ── Responses Tab ── */}
      {tab === 'responses' && (
        <div className="card">
          <div className="card-header">
            <h3>Responses <span style={{ color:'var(--text3)', fontWeight:400 }}>({total})</span></h3>
          </div>
          {responses.length === 0 ? (
            <div className="empty"><i className="fas fa-inbox" /><p>No responses yet. Share the form link to start collecting!</p></div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Rating</th>
                    <th>Sentiment</th>
                    <th>Response Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map(r => {
                    const ratingAns = r.answers?.find(a => a.type === 'rating')
                    const textAns   = r.answers?.find(a => a.type === 'textarea' || a.type === 'text')
                    return (
                      <tr key={r._id}>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td>
                          {ratingAns ? (
                            <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                              {'★'.repeat(ratingAns.value)}{'☆'.repeat(5 - ratingAns.value)}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {r.sentiment ? (
                            <span className={`sentiment sentiment-${sentimentCls(r.sentiment)}`}>
                              <i className={`fas ${r.sentiment === 'positive' ? 'fa-smile' : r.sentiment === 'negative' ? 'fa-frown' : 'fa-meh'}`} />
                              {r.sentiment}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {textAns?.value || r.answers?.[0]?.value || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {total > PER_PAGE && (
                <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', padding:'1rem' }}>
                  <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <i className="fas fa-chevron-left" />
                  </button>
                  <span style={{ color:'var(--text2)', alignSelf:'center', fontSize:'0.85rem' }}>
                    Page {page} of {Math.ceil(total / PER_PAGE)}
                  </span>
                  <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / PER_PAGE)} onClick={() => setPage(p => p + 1)}>
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {tab === 'analytics' && (
        <div className="card">
          <div className="card-header"><h3>Rating Distribution</h3></div>
          <div className="card-body">
            {[5,4,3,2,1].map(n => (
              <div className="rating-bar-row" key={n}>
                <div className="rating-bar-label">{'★'.repeat(n)}</div>
                <div className="rating-bar-track">
                  <div className="rating-bar-fill" style={{ width: `${((ratingDist[n] || 0) / maxCount) * 100}%` }} />
                </div>
                <div className="rating-bar-count">{ratingDist[n] || 0}</div>
              </div>
            ))}

            {analytics?.sentimentBreakdown && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Sentiment Breakdown</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {Object.entries(analytics.sentimentBreakdown).map(([s, c]) => (
                    <div key={s} style={{ background:'var(--surface2)', padding:'0.8rem 1.2rem', borderRadius:'var(--radius)', textAlign:'center', minWidth:100 }}>
                      <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--text)' }}>{c}</div>
                      <div className={`sentiment sentiment-${sentimentCls(s)}`} style={{ marginTop:'0.3rem', display:'inline-flex' }}>
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
