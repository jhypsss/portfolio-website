import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import MobileAdminRow from '../components/MobileAdminRow'

function ContactMessages() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewingMessage, setViewingMessage] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadMessages() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setMessages(data ?? [])
      }
      setIsLoading(false)
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  async function openViewModal(message) {
    setError(null)
    setViewingMessage({ ...message, is_read: true })

    if (message.is_read) return

    setMessages((currentMessages) =>
      currentMessages.map((item) =>
        item.id === message.id ? { ...item, is_read: true } : item,
      ),
    )

    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', message.id)

    if (updateError) {
      setError(updateError.message)
      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.id === message.id ? { ...item, is_read: false } : item,
        ),
      )
      setViewingMessage((currentMessage) =>
        currentMessage?.id === message.id ? { ...currentMessage, is_read: false } : currentMessage,
      )
    }
  }

  function closeViewModal() {
    setViewingMessage(null)
  }

  async function handleDelete(id) {
    const { error: deleteError } = await supabase.from('contact_messages').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      setPendingDeleteId(null)
      return
    }
    if (viewingMessage?.id === id) setViewingMessage(null)
    setPendingDeleteId(null)
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="admin-manage">
      <div className="admin-toolbar">
        <h1>Contact Messages</h1>
      </div>

      {error && <p role="alert" className="error-text">{error}</p>}

      {isLoading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <EmptyState message="No messages yet." />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message.id}
                  className={message.is_read ? undefined : 'message-unread'}
                  onClick={() => openViewModal(message)}
                >
                  <td>{message.sender_name}</td>
                  <td>{message.sender_email}</td>
                  <td>{message.is_read ? 'Read' : 'Unread'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && messages.length > 0 && (
        <div className="mobile-list">
          {messages.map((message) => (
            <MobileAdminRow
              key={message.id}
              onClick={() => openViewModal(message)}
            >
              <span className="mobile-row-line1">{message.sender_name}</span>
              <span className="mobile-row-line2">
                {message.sender_email} ({message.is_read ? 'Read' : 'Unread'})
              </span>
            </MobileAdminRow>
          ))}
        </div>
      )}

      <Modal isOpen={Boolean(viewingMessage)} onClose={closeViewModal} title="Message Details">
        {viewingMessage && (
          <div className="admin-message-detail">
            <p>
              <strong>Name:</strong> {viewingMessage.sender_name}
            </p>
            <p>
              <strong>Email:</strong> {viewingMessage.sender_email}
            </p>
            <p>
              <strong>Message:</strong>
            </p>
            <p>{viewingMessage.message}</p>

            <div className="admin-form-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  const id = viewingMessage.id
                  closeViewModal()
                  setPendingDeleteId(id)
                }}
              >
                Delete
              </button>
              <button type="button" className="btn btn-secondary" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}

export default ContactMessages
