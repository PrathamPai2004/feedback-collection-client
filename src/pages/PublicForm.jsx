import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PublicForm() {
  const { slug } = useParams()
  const navigate  = useNavigate()
  const [form, setForm]       = useState(null)
  const [answers, setAnswers] = useState({})
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    axios.get(`/forms/slug/${slug}`)
      .then(r => {
        setForm(r.data.form)
        const init = {}
        r.data.form.fields.forEach(f => { init[f._id || f.label] = '' })
        setAnswers(init)
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
      })
  }, [slug])

  const handleChange = (key, val) => setAnswers(a => ({ ...a, [key]: val }))

  const submit = async e => {
    e.preventDefault(); setError(''); setSubmitting(true)
    try {
      const answerList = form.fields.map(f => ({
        fieldId:  f._id || f.label,
        label:    f.label,
        type:     f.type,
        value:    f.type === 'rating' ? rating : answers[f._id || f.label]
      }))
      await axios.post(`/feedback/${form._id}`, { answers: answerList })
      navigate('/thank-you')
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  if (notFound) return (
    <div className="public-form-bg">
      <div className="public-form-card glass" style={{ textAlign:'center' }}>
        <i className="fas fa-exclamation-triangle" style={{ fontSize:'3rem', color:'var(--warning)', marginBottom:'1rem' }} />
        <h2>Form Not Found</h2>
        <p>This form does not exist or has been deactivated.</p>
      </div>
    </div>
  )

  if (!form) return <div className="full-loader"><div className="spinner-lg" /></div>

  return (
    <div className="public-form-bg">
      <div className="public-form-card glass">
        <div className="public-form-logo">
          <i className="fas fa-comment-dots" /> FeedbackFlow
        </div>
        <h2 style={{ marginBottom:'0.3rem' }}>{form.title}</h2>
        {form.description && <p style={{ marginBottom:'1.5rem', fontSize:'0.9rem' }}>{form.description}</p>}

        {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

        <form onSubmit={submit}>
          {form.fields.map(f => {
            const key = f._id || f.label
            return (
              <div className="form-field" key={key}>
                <label>
                  {f.label}
                  {f.required && <span className="required">*</span>}
                </label>

                {f.type === 'rating' && (
                  <div className="stars">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`star${(hover || rating) >= n ? ' active' : ''}`}
                        onClick={() => setRating(n)}
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}>★</span>
                    ))}
                  </div>
                )}

                {f.type === 'text' && (
                  <div className="field-plain">
                    <input value={answers[key]} onChange={e => handleChange(key, e.target.value)} required={f.required} />
                  </div>
                )}

                {f.type === 'email' && (
                  <div className="field-plain">
                    <input type="email" value={answers[key]} onChange={e => handleChange(key, e.target.value)} required={f.required} />
                  </div>
                )}

                {f.type === 'textarea' && (
                  <div className="field-plain">
                    <textarea rows={4} value={answers[key]} onChange={e => handleChange(key, e.target.value)} required={f.required} />
                  </div>
                )}

                {f.type === 'select' && (
                  <div className="field-plain">
                    <select value={answers[key]} onChange={e => handleChange(key, e.target.value)} required={f.required}>
                      <option value="">Select an option…</option>
                      {f.options?.map(o => <option key={o} value={o.trim()}>{o.trim()}</option>)}
                    </select>
                  </div>
                )}

                {f.type === 'radio' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.2rem' }}>
                    {f.options?.map(o => (
                      <label key={o} style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', color:'var(--text2)', fontSize:'0.9rem' }}>
                        <input type="radio" name={key} value={o.trim()} checked={answers[key] === o.trim()}
                          onChange={() => handleChange(key, o.trim())} required={f.required} />
                        {o.trim()}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <button id="submit-feedback-btn" type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop:'0.5rem' }}>
            {submitting ? <><span className="spinner" /> Submitting…</> : <><i className="fas fa-paper-plane" /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  )
}
