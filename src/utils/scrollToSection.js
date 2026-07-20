export function scrollToSection(event, id) {
  event.preventDefault()

  if (id === 'home') {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  } else {
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  window.history.pushState(null, '', '/')
}
