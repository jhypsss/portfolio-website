import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { scrollToSection } from '../utils/scrollToSection'
import { supabase } from '../services/supabaseClient'

const NAV_LINKS = [
  { href: '#home', label: 'Home', key: null },
  { href: '#about', label: 'About', key: 'about' },
  { href: '#skills', label: 'Skills', key: 'skills' },
  { href: '#projects', label: 'Projects', key: 'projects' },
  { href: '#experience', label: 'Experience', key: 'experience' },
  { href: '#contact', label: 'Contact', key: null },
]

function Navbar({ visibleSections = {} }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [fullName, setFullName] = useState('Portfolio')

  useEffect(() => {
    let isMounted = true

    async function loadFullName() {
      const { data, error } = await supabase
        .from('profile')
        .select('full_name')
        .limit(1)
        .maybeSingle()

      if (isMounted && !error && data?.full_name) {
        setFullName(data.full_name)
        document.title = `${data.full_name} | Portfolio`
      }
    }

    loadFullName()

    return () => {
      isMounted = false
    }
  }, [])

  const links = NAV_LINKS.filter((link) => !link.key || visibleSections[link.key] !== false)

  function handleNavClick(event, id) {
    scrollToSection(event, id)
    setIsMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand" onClick={(event) => handleNavClick(event, 'home')}>
          {fullName}
        </a>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={isMenuOpen ? 'navbar-links is-open' : 'navbar-links'}
          aria-label="Primary"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href.slice(1))}
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {isMenuOpen && (
          <div className="navbar-overlay" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
        )}
      </div>
    </header>
  )
}

export default Navbar
