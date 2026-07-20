import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function Projects({ onVisibilityChange }) {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProjects() {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id, title, description, tech_stack, image_url, live_url, github_url, is_featured')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        onVisibilityChange?.(true)
      } else {
        const items = data ?? []
        setProjects(items)
        onVisibilityChange?.(items.length > 0)
      }
      setIsLoading(false)
    }

    fetchProjects()

    return () => {
      isMounted = false
    }
  }, [onVisibilityChange])

  if (!isLoading && !error && projects.length === 0) return null

  return (
    <section id="projects" className="projects-section">
      <h2>Projects</h2>
      {isLoading && <p>Loading projects...</p>}
      {error && <p className="error-text">Unable to load projects: {error}</p>}
      {!isLoading && !error && (
        <div className="projects-grid">
          {projects.map((project) => (
            <article key={project.id} className="project-card">
              {project.image_url && (
                <img src={project.image_url} alt={project.title} />
              )}
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {project.tech_stack && <p className="tech-stack">{project.tech_stack}</p>}
              <div className="project-links">
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noreferrer">
                    Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Projects
