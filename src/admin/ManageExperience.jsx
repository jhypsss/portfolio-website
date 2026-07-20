import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import AdminAddButton from '../components/AdminAddButton'
import AdminDetailModal from '../components/AdminDetailModal'
import MobileAdminRow from '../components/MobileAdminRow'

function formatDateLabel(value) {
  if (!value) return 'Present'
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
}

const EMPTY_FORM = {
  id: null,
  company_name: '',
  position_name: '',
  date_from: '',
  date_to: '',
  description: '',
  is_present: false,
}

function ManageExperience() {
  const [experience, setExperience] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewingItem, setViewingItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadExperience() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('experience')
        .select('*')
        .order('date_from', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setExperience(data ?? [])
      }
      setIsLoading(false)
    }

    loadExperience()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function openAddModal() {
    setForm(EMPTY_FORM)
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(item) {
    setForm({ ...EMPTY_FORM, ...item, is_present: !item.date_to })
    setError(null)
    setViewingItem(null)
    setIsModalOpen(true)
  }

  function requestDelete(item) {
    setViewingItem(null)
    setPendingDeleteId(item.id)
  }

  function closeModal() {
    setIsModalOpen(false)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const payload = {
      company_name: form.company_name,
      position_name: form.position_name,
      date_from: form.date_from || null,
      date_to: form.is_present ? null : form.date_to || null,
      description: form.description,
    }

    const { error: saveError } = form.id
      ? await supabase.from('experience').update(payload).eq('id', form.id)
      : await supabase.from('experience').insert(payload)

    setIsSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    closeModal()
    setRefreshKey((key) => key + 1)
  }

  async function handleDelete(id) {
    const { error: deleteError } = await supabase.from('experience').delete().eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      setPendingDeleteId(null)
      return
    }
    setPendingDeleteId(null)
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="admin-manage">
      <div className="admin-toolbar">
        <h1>Manage Experience</h1>
        <div className="admin-toolbar-actions">
          <AdminAddButton label="Add Experience" onClick={openAddModal} />
        </div>
      </div>

      {error && !isModalOpen && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      {isLoading ? (
        <p>Loading experience...</p>
      ) : experience.length === 0 ? (
        <EmptyState message="No experience entries yet." actionLabel="Add Experience" onAction={openAddModal} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {experience.map((item) => (
                <tr key={item.id} onClick={() => setViewingItem(item)}>
                  <td>{item.position_name}</td>
                  <td>{item.company_name}</td>
                  <td>{item.date_to ? 'Past' : 'Present'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && experience.length > 0 && (
        <div className="mobile-list">
          {experience.map((item) => (
            <MobileAdminRow key={item.id} onClick={() => setViewingItem(item)}>
              <span className="mobile-row-line1">{item.position_name}</span>
              <span className="mobile-row-line2">
                {item.company_name} ({formatDateLabel(item.date_from)} - {formatDateLabel(item.date_to)})
              </span>
            </MobileAdminRow>
          ))}
        </div>
      )}

      <AdminDetailModal
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        title="Experience Details"
        fields={[
          { label: 'Position', value: viewingItem?.position_name },
          { label: 'Company', value: viewingItem?.company_name },
          { label: 'Start Date', value: formatDateLabel(viewingItem?.date_from) },
          { label: 'End Date', value: formatDateLabel(viewingItem?.date_to) },
          { label: 'Description', value: viewingItem?.description },
        ]}
        onEdit={viewingItem ? () => openEditModal(viewingItem) : undefined}
        onDelete={viewingItem ? () => requestDelete(viewingItem) : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={form.id ? 'Edit Experience' : 'Add Experience'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <label htmlFor="experience-company">Company</label>
          <input
            id="experience-company"
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="experience-position">Position</label>
          <input
            id="experience-position"
            name="position_name"
            value={form.position_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="experience-date-from">Start Date</label>
          <input
            id="experience-date-from"
            name="date_from"
            type="date"
            value={form.date_from ?? ''}
            onChange={handleChange}
          />

          <label htmlFor="experience-date-to">End Date</label>
          <input
            id="experience-date-to"
            name="date_to"
            type="date"
            value={form.is_present ? '' : form.date_to ?? ''}
            onChange={handleChange}
            disabled={form.is_present}
          />

          <label className="checkbox-label">
            <input type="checkbox" name="is_present" checked={form.is_present} onChange={handleChange} />
            I currently work here (Present)
          </label>

          <label htmlFor="experience-description">Description</label>
          <textarea
            id="experience-description"
            name="description"
            rows={3}
            value={form.description ?? ''}
            onChange={handleChange}
          />

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : form.id ? 'Update Experience' : 'Add Experience'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
          </div>

          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete Experience"
        message="Are you sure you want to delete this experience entry? This action cannot be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}

export default ManageExperience
