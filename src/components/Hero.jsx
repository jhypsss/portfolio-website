import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { scrollToSection } from '../utils/scrollToSection'

const ROTATE_INTERVAL_MS = 2500

const DEFAULT_PROFILE = {
  full_name: '',
  job_title: '',
  short_intro: '',
  resume_url: '',
  profile_image_url: '',
}

function Hero() {
  const [profile, setProfile] = useState(null)
  const [techStack, setTechStack] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name, job_title, short_intro, resume_url, profile_image_url')
        .limit(1)
        .maybeSingle()

      if (isMounted && !error && data) {
        setProfile(data)
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchTechStack() {
      const { data, error } = await supabase
        .from('tech_stack')
        .select('id, name')
        .order('display_order', { ascending: true })

      if (isMounted && !error) {
        setTechStack(data ?? [])
      }
    }

    fetchTechStack()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (techStack.length === 0) return undefined

    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % techStack.length)
    }, ROTATE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [techStack])

  const activeTech = techStack[activeIndex]
  const {
    full_name: fullName,
    job_title: jobTitle,
    short_intro: shortIntro,
    resume_url: resumeUrl,
    profile_image_url: profileImageUrl,
  } = {
    ...DEFAULT_PROFILE,
    ...profile,
  }

  return (
    <section id="home" className="hero-section">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="hero-greeting">Hi, I&apos;m {fullName}</p>
          <h1>{jobTitle}</h1>
          <h2>{shortIntro}</h2>
          {activeTech && (
            <p className="hero-stack" key={activeTech.id}>
              {activeTech.name}
            </p>
          )}
          <div className="hero-actions">
            <a
              href="#projects"
              className="btn btn-primary"
              onClick={(event) => scrollToSection(event, 'projects')}
            >
              View Projects
            </a>
            <a href={resumeUrl} className="btn btn-secondary" download>
              Download Resume
            </a>
            <a
              href="#contact"
              className="btn btn-secondary"
              onClick={(event) => scrollToSection(event, 'contact')}
            >
              Contact Me
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-photo-frame">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={fullName} />
            ) : (
              <div className="hero-photo-placeholder" aria-hidden="true">
                {fullName.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
