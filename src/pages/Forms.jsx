import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = { title: '', description: '', fields: [], isActive: true }

export default function Forms() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator'
  const navigate = useNavigate()

  const [forms, setForms]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [copied, setCopied]     = useState('')
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    axios.get('/forms').then(r => setForms(r.data.forms || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  /* ─── Admin helpers ─── */
  const openNew   = () => { setForm(EMPTY_FORM); setModal(true) }
  const addField  = () => setForm(f => ({ ...f, fields: [...f.fields, { label: '', type: 'text', required: true, options: [] }] }))
  const updateField = (i, key, val) => setForm(f => { const fields = [...f.fields]; fields[i] = { ...fields[i], [key]: val }; return { ...f, fields } })
  const removeField = i => setForm(f => ({ ...f, fields: f.fields.filter((_, idx) => idx !== i) }))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try { await axios.post('/forms', form); setModal(false); load() }
    catch (err) { alert(err.response?.data?.error || 'Failed to save form') }
    finally { setSaving(false) }
  }

  const toggleActive = async (id, current) => {
    await axios.patch(`/forms/${id}`, { isActive: !current }); load()
  }

  const deleteForm = async () => {
    await axios.delete(`/forms/${deleteId}`); setDeleteId(null); load()
  }

  const copyLink = slug => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`)
    setCopied(slug); setTimeout(() => setCopied(''), 2000)
  }

  /* ─── Active forms for regular users ─── */
  const activeForms = forms.filter(f => f.isActive)

  /* ═══════════════════════════════════════
     REGULAR USER VIEW
  ═══════════════════════════════════════ */
  if (!isAdmin) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Available Forms</h1>
            <p>Select a form below to share your feedback</p>
          </div>
        </div>

        {loading ? (
          <div className="full-loader" style={{ minHeight: '40vh' }}><div className="spinner-lg" /></div>
        ) : activeForms.length === 0 ? (
          <div className="card">
            <div className="empty">
              <i className="fas fa-clipboard" />
              <p>No active forms at the moment. Check back later!</p>
            </div>
          </div>
        ) : (
          <div className="form-cards-grid">
            {activeForms.map(f => (
              <div className="form-card" key={f._id}>
                <div className="form-card-icon">
                  <i className="fas fa-wpforms" />
                </div>
                <div className="form-card-body">
                  <h3>{f.title}</h3>
                  {f.description && <p>{f.description}</p>}
                  <div className="form-card-meta">
                    <span><i className="fas fa-list" /> {f.fields?.length ?? 0} fields</span>
                    <span><i className="fas fa-inbox" /> {f.responseCount ?? 0} responses</span>
                  </div>
                </div>
                <Link
                  to={`/f/${f.slug}`}
                  className="btn btn-primary"
                  id={`fill-form-${f._id}`}
                >
                  <i className="fas fa-paper-plane" /> Fill Form
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ═══════════════════════════════════════
     ADMIN VIEW
  ═══════════════════════════════════════ */
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Forms</h1>
          <p>Create and manage your feedback collection forms</p>
        </div>
        <button id="new-form-btn" className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus" /> New Form
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty"><i className="fas fa-spinner fa-spin" /><p>Loading forms…</p></div>
        ) : forms.length === 0 ? (
          <div className="empty">
            <i className="fas fa-clipboard-list" />
            <p>No forms yet. Create one to start collecting feedback.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Fields</th>
                <th>Responses</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(f => (
                <tr key={f._id}>
                  <td style={{ color: 'var(--text)', fontWeight: 600 }}>{f.title}</td>
                  <td>{f.fields?.length ?? 0}</td>
                  <td>{f.responseCount ?? 0}</td>
                  <td>
                    <span
                      className={`badge badge-${f.isActive ? 'green' : 'gray'}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle"
                      onClick={() => toggleActive(f._id, f.isActive)}
                    >
                      {f.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {/* Fill form (preview) */}
                      <Link to={`/f/${f.slug}`} target="_blank" className="btn btn-ghost btn-sm btn-icon" title="Preview / Fill form">
                        <i className="fas fa-external-link-alt" />
                      </Link>
                      {/* Copy public link */}
                      <button className="btn btn-ghost btn-sm btn-icon" title="Copy public link" onClick={() => copyLink(f.slug)}>
                        <i className={`fas ${copied === f.slug ? 'fa-check' : 'fa-link'}`} />
                      </button>
                      {/* View responses */}
                      <Link to={`/forms/${f._id}/feedback`} className="btn btn-ghost btn-sm btn-icon" title="View responses">
                        <i className="fas fa-eye" />
                      </Link>
                      {/* Delete */}
                      <button className="btn btn-danger btn-sm btn-icon" title="Delete form" onClick={() => setDeleteId(f._id)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Form Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Form</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}><i className="fas fa-times" /></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="field-plain">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>Form Title *</label>
                  <input id="form-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Product Feedback" required />
                </div>
                <div className="field-plain">
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" rows={2} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text2)' }}>Fields</label>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addField}><i className="fas fa-plus" /> Add Field</button>
                  </div>
                  {form.fields.map((field, i) => (
                    <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0.8rem', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input className="field-plain" style={{ background: 'var(--surface)' }} value={field.label} onChange={e => updateField(i, 'label', e.target.value)} placeholder="Field label" />
                        <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeField(i)}><i className="fas fa-times" /></button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div className="field-plain">
                          <select value={field.type} onChange={e => updateField(i, 'type', e.target.value)}>
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="rating">Rating (1–5 ★)</option>
                            <option value="select">Dropdown</option>
                            <option value="radio">Multiple Choice</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text2)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={field.required} onChange={e => updateField(i, 'required', e.target.checked)} /> Required
                        </label>
                      </div>
                      {(field.type === 'select' || field.type === 'radio') && (
                        <div className="field-plain" style={{ marginTop: '0.5rem' }}>
                          <input value={field.options?.join(',')} onChange={e => updateField(i, 'options', e.target.value.split(','))} placeholder="Option A, Option B, Option C" />
                        </div>
                      )}
                    </div>
                  ))}
                  {form.fields.length === 0 && (
                    <p style={{ color: 'var(--text3)', fontSize: '0.82rem', textAlign: 'center', padding: '0.5rem' }}>
                      No fields — a default Rating + Comments field will be added automatically.
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving…</> : <><i className="fas fa-check" /> Create Form</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header"><h3>Delete Form</h3></div>
            <div className="modal-body"><p>Are you sure? This permanently deletes the form and <strong>all its responses</strong>.</p></div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteForm}><i className="fas fa-trash" /> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
