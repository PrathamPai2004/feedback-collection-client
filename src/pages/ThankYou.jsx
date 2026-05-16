import { Link } from 'react-router-dom'

export default function ThankYou() {
  return (
    <div className="thankyou-wrap">
      <div className="public-form-card glass thankyou-card">
        <div className="thankyou-icon"><i className="fas fa-check-circle" /></div>
        <h2>Thank You!</h2>
        <p style={{ marginBottom: '1.5rem' }}>Your feedback has been submitted successfully. We really appreciate your time and input.</p>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
