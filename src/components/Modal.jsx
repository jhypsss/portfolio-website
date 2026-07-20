import { useEffect, useState } from 'react'

const TRANSITION_MS = 200

function Modal({ isOpen, onClose, title, children }) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeoutIds = []

    if (isOpen) {
      // Mount first, then flip the visibility class on the next tick so the
      // enter transition actually runs instead of starting in its end state.
      timeoutIds.push(setTimeout(() => setShouldRender(true), 0))
      timeoutIds.push(setTimeout(() => setIsVisible(true), 10))
    } else {
      timeoutIds.push(setTimeout(() => setIsVisible(false), 0))
      timeoutIds.push(setTimeout(() => setShouldRender(false), TRANSITION_MS))
    }

    return () => timeoutIds.forEach(clearTimeout)
  }, [isOpen])

  useEffect(() => {
    if (!shouldRender) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shouldRender, onClose])

  if (!shouldRender) return null

  return (
    <div className={isVisible ? 'modal-backdrop is-visible' : 'modal-backdrop'}>
      <div
        className={isVisible ? 'modal is-visible' : 'modal'}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
