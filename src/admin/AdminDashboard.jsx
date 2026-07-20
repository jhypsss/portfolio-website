import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

const COUNT_QUERIES = [
  {
    key: 'projects',
    label: 'Total Projects',
    table: 'projects',
    link: '/admin/projects',
    variant: 'orange',
  },
  {
    key: 'skills',
    label: 'Total Skills',
    table: 'skills',
    link: '/admin/skills',
    variant: 'blue',
  },
  {
    key: 'experience',
    label: 'Total Experience Items',
    table: 'experience',
    link: '/admin/experience',
    variant: 'teal',
  },
  {
    key: 'messages',
    label: 'Total Contact Messages',
    table: 'contact_messages',
    link: '/admin/messages',
    variant: 'purple',
  },
]

function AdminDashboard() {
  const [counts, setCounts] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadCounts() {
      const results = await Promise.all(
        COUNT_QUERIES.map(({ table }) =>
          supabase.from(table).select('id', { count: 'exact', head: true }),
        ),
      )

      if (!isMounted) return

      const nextCounts = {}
      results.forEach(({ count }, index) => {
        nextCounts[COUNT_QUERIES[index].key] = count ?? 0
      })
      setCounts(nextCounts)
      setIsLoading(false)
    }

    loadCounts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="admin-dashboard">
      <h1>Dashboard</h1>

      {isLoading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="dashboard-cards">
          {COUNT_QUERIES.map(({ key, label, link, variant }) => (
            <Link key={key} to={link} className={`dashboard-card dashboard-card--${variant}`}>
              <p className="dashboard-card-count">{counts[key]}</p>
              <p className="dashboard-card-label">{label}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default AdminDashboard

