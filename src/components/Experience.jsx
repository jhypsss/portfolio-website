import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function formatDate(value) {
  if (!value) return 'Present'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  })
}

function Experience({ onVisibilityChange }) {
  const [experience, setExperience] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchExperience() {
      const { data, error: fetchError } = await supabase
        .from('experience')
        .select('id, company_name, position_name, date_from, date_to, description')
        .order('date_from', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        onVisibilityChange?.(true)
      } else {
        const items = data ?? []
        setExperience(items)
        onVisibilityChange?.(items.length > 0)
      }
      setIsLoading(false)
    }

    fetchExperience()

    return () => {
      isMounted = false
    }
  }, [onVisibilityChange])

  if (!isLoading && !error && experience.length === 0) return null

  return (
    <section id="experience" className="experience-section">
      <h2>Experience</h2>
      {isLoading && <p>Loading experience...</p>}
      {error && <p className="error-text">Unable to load experience: {error}</p>}
      {!isLoading && !error && (
        <ul className="experience-list">
          {experience.map((item) => (
            <li key={item.id} className="experience-item">
              <h3>{item.position_name}</h3>
              <p className="experience-company">{item.company_name}</p>
              <p className="experience-dates">
                {formatDate(item.date_from)} - {formatDate(item.date_to)}
              </p>
              {item.description && <p>{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Experience
