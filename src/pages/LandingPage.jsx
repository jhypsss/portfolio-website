import { useCallback, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Experience from '../components/Experience'
import Contact from '../components/Contact'
import Footer from '../components/Footer'

function LandingPage() {
  const [visibleSections, setVisibleSections] = useState({
    about: true,
    skills: true,
    projects: true,
    experience: true,
  })

  const handleAboutVisibility = useCallback((visible) => {
    setVisibleSections((prev) => ({ ...prev, about: visible }))
  }, [])

  const handleSkillsVisibility = useCallback((visible) => {
    setVisibleSections((prev) => ({ ...prev, skills: visible }))
  }, [])

  const handleProjectsVisibility = useCallback((visible) => {
    setVisibleSections((prev) => ({ ...prev, projects: visible }))
  }, [])

  const handleExperienceVisibility = useCallback((visible) => {
    setVisibleSections((prev) => ({ ...prev, experience: visible }))
  }, [])

  return (
    <>
      <Navbar visibleSections={visibleSections} />
      <main>
        <Hero />
        <About onVisibilityChange={handleAboutVisibility} />
        <Skills onVisibilityChange={handleSkillsVisibility} />
        <Projects onVisibilityChange={handleProjectsVisibility} />
        <Experience onVisibilityChange={handleExperienceVisibility} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default LandingPage
