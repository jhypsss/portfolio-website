import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

function About({ onVisibilityChange }) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profile')
        .select('about_me, profile_image_url')
        .limit(1)
        .maybeSingle()

      if (!isMounted) return

      const hasContent = Boolean(!error && data?.about_me)
      if (hasContent) setProfile(data)
      setIsLoading(false)
      onVisibilityChange?.(hasContent)
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [onVisibilityChange])

  if (!isLoading && !profile) return null

  return (
    <section id="about" className="about-section">
      <h2>About Me</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {profile?.profile_image_url && (
            <img src={profile.profile_image_url} alt="Portrait of Patrick Torres" className="about-photo" />
          )}
          <p>{profile?.about_me}</p>
        </>
      )}
    </section>
  )
}

export default About
