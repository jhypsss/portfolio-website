import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading, null = no session

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) setSession(newSession)
    })

    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  if (session === undefined) {
    return <p className="admin-loading">Checking session...</p>
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return children ?? <Outlet />
}

export default ProtectedRoute
