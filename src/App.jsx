import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Forms from './pages/Forms'
import FeedbackView from './pages/FeedbackView'
import PublicForm from './pages/PublicForm'
import ThankYou from './pages/ThankYou'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="full-loader"><div className="spinner-lg" /></div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/f/:slug" element={<PublicForm />} />
      <Route path="/thank-you" element={<ThankYou />} />

      {/* Protected */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="forms" element={<Forms />} />
        <Route path="forms/:id/feedback" element={<FeedbackView />} />
      </Route>
    </Routes>
  )
}
