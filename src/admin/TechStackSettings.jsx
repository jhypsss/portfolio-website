import { useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog'
import AdminDetailModal from '../components/AdminDetailModal'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import MobileAdminRow from '../components/MobileAdminRow'
import { supabase } from '../services/supabaseClient'

const EMPTY_FORM = { id: null, name: '', display_order: 0 }

function TechStackSettings() {
  const [technologies, setTechnologies] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingTechnology, setViewingTechnology] = useState(null)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTechnologies() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('tech_stack')
        .select('id, name, display_order, created_at')
        .order('display_order', { ascending: true })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setTechnologies(data ?? [])
      }
      setIsLoading(false)
    }

    loadTechnologies()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  function openAddModal() {
    const nextOrder = technologies.length === 0
      ? 1
      : Math.max(...technologies.map((technology) => technology.display_order ?? 0)) + 1

    setForm({ ...EMPTY_FORM, display_order: nextOrder })
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(technology) {
    setForm({
      id: technology.id,
      name: technology.name,
      display_order: technology.display_order ?? 0,
    })
    setError(null)
    setViewingTechnology(null)
    setIsModalOpen(true)
  }

  function requestDelete(technology) {
    setViewingTechnology(null)
    setPendingDeleteId(technology.id)
  }

  function closeModal() {
    setIsModalOpen(false)
    setForm(EMPTY_FORM)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previousForm) => ({ ...previousForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      display_order: Number(form.display_order),
    }
    const { error: saveError } = form.id
      ? await supabase.from('tech_stack').update(payload).eq('id', form.id)
      : await supabase.from('tech_stack').insert(payload)

    setIsSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    closeModal()
    setRefreshKey((key) => key + 1)
  }

  async function handleDelete() {
    const { error: deleteError } = await supabase
      .from('tech_stack')
      .delete()
      .eq('id', pendingDeleteId)

    if (deleteError) {
      setError(deleteError.message)
      setPendingDeleteId(null)
      return
    }

    setPendingDeleteId(null)
    setRefreshKey((key) => key + 1)
  }

  return (
    <section className="profile-tech-stack" aria-labelledby="tech-stack-heading">
      <div className="admin-toolbar">
        <div>
          <h2 id="tech-stack-heading">Tech Stack</h2>
          <p>Manage the technologies rotating in the homepage hero.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddModal}>
          Add Technology
        </button>
      </div>

      {error && !isModalOpen && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      {isLoading ? (
        <p>Loading tech stack...</p>
      ) : technologies.length === 0 ? (
        <EmptyState
          message="No technologies yet."
          actionLabel="Add Technology"
          onAction={openAddModal}
        />
      ) : (
        <div className="admin-table-wrapper profile-tech-table">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Display Order</th>
              </tr>
            </thead>
            <tbody>
              {technologies.map((technology) => (
                <tr key={technology.id} onClick={() => setViewingTechnology(technology)}>
                  <td>{technology.name}</td>
                  <td>{technology.display_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && technologies.length > 0 && (
        <div className="mobile-list profile-tech-mobile-list">
          {technologies.map((technology) => (
            <MobileAdminRow key={technology.id} onClick={() => setViewingTechnology(technology)}>
              <span className="mobile-row-line1">{technology.name}</span>
              <span className="mobile-row-line2">Display order: {technology.display_order}</span>
            </MobileAdminRow>
          ))}
        </div>
      )}

      <AdminDetailModal
        isOpen={Boolean(viewingTechnology)}
        onClose={() => setViewingTechnology(null)}
        title="Technology Details"
        fields={[
          { label: 'Name', value: viewingTechnology?.name },
          { label: 'Display Order', value: viewingTechnology?.display_order },
        ]}
        onEdit={viewingTechnology ? () => openEditModal(viewingTechnology) : undefined}
        onDelete={viewingTechnology ? () => requestDelete(viewingTechnology) : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={form.id ? 'Edit Technology' : 'Add Technology'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <label htmlFor="technology-name">Name</label>
          <input
            id="technology-name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="technology-display-order">Display Order</label>
          <input
            id="technology-display-order"
            name="display_order"
            type="number"
            min="0"
            step="1"
            value={form.display_order}
            onChange={handleChange}
            required
          />

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : form.id ? 'Update Technology' : 'Add Technology'}
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
        title="Delete Technology"
        message="Are you sure you want to delete this technology? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}

export default TechStackSettings