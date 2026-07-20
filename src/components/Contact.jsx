import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

const INITIAL_FORM = { name: '', email: '', message: '' }

function Contact() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    const { error: insertError } = await supabase.from('contact_messages').insert({
      sender_name: form.name,
      sender_email: form.email,
      message: form.message,
    })

    if (insertError) {
      setError(insertError.message)
      setStatus('error')
      return
    }

    setForm(INITIAL_FORM)
    setStatus('success')
  }

  return (
    <section id="contact" className="contact-section">
      <h2>Contact</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <label htmlFor="contact-name">Name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>

        {status === 'success' && <p role="status">Thanks! Your message has been sent.</p>}
        {status === 'error' && (
          <p role="alert" className="error-text">
            Unable to send your message: {error}
          </p>
        )}
      </form>
    </section>
  )
}

export default Contact
