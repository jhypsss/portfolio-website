import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function Skills({ onVisibilityChange }) {
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchSkills() {
      const { data, error: fetchError } = await supabase
        .from('skills')
        .select('id, skill_name, category')
        .order('category', { ascending: true })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        onVisibilityChange?.(true)
      } else {
        const items = data ?? []
        setSkills(items)
        onVisibilityChange?.(items.length > 0)
      }
      setIsLoading(false)
    }

    fetchSkills()

    return () => {
      isMounted = false
    }
  }, [onVisibilityChange])

  const skillsByCategory = skills.reduce((groups, skill) => {
    const category = skill.category ?? 'Other'
    groups[category] = groups[category] ?? []
    groups[category].push(skill)
    return groups
  }, {})

  if (!isLoading && !error && skills.length === 0) return null

  return (
    <section id="skills" className="skills-section">
      <h2>Skills</h2>
      {isLoading && <p>Loading skills...</p>}
      {error && <p className="error-text">Unable to load skills: {error}</p>}
      {!isLoading && !error && (
        <div className="skills-grid">
          {Object.entries(skillsByCategory).map(([category, items]) => (
            <div key={category} className="skills-category">
              <h3>{category}</h3>
              <ul>
                {items.map((skill) => (
                  <li key={skill.id}>{skill.skill_name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Skills
