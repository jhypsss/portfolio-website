import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import { scrollToSection } from '../utils/scrollToSection'

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

  const links = NAV_LINKS.filter((link) => !link.key || visibleSections[link.key] !== false)

  function handleNavClick(event, id) {
    scrollToSection(event, id)
    setIsMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#home" className="navbar-brand" onClick={(event) => handleNavClick(event, 'home')}>
          Patrick Torres
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
