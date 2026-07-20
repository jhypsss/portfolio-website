import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import AdminAddButton from '../components/AdminAddButton'
import AdminDetailModal from '../components/AdminDetailModal'
import MobileAdminRow from '../components/MobileAdminRow'

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Cloud', 'Mainframe', 'Tools']
const EMPTY_FORM = { id: null, skill_name: '', category: CATEGORIES[0] }

function ManageSkills() {
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewingSkill, setViewingSkill] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadSkills() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setSkills(data ?? [])
      }
      setIsLoading(false)
    }

    loadSkills()

    return () => {
      isMounted = false
    }
  }, [refreshKey])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function openAddModal() {
    setForm(EMPTY_FORM)
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(skill) {
    setForm(skill)
    setError(null)
    setViewingSkill(null)
    setIsModalOpen(true)
  }

  function requestDelete(skill) {
    setViewingSkill(null)
    setPendingDeleteId(skill.id)
  }

  function closeModal() {
    setIsModalOpen(false)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    const payload = { skill_name: form.skill_name, category: form.category }
    const { error: saveError } = form.id
      ? await supabase.from('skills').update(payload).eq('id', form.id)
      : await supabase.from('skills').insert(payload)

    setIsSaving(false)

    if (saveError) {
      setError(saveError.message)
      return
    }

    closeModal()
    setRefreshKey((key) => key + 1)
  }

  async function handleDelete(id) {
    const { error: deleteError } = await supabase.from('skills').delete().eq('id', id)
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
        <h1>Manage Skills</h1>
        <div className="admin-toolbar-actions">
          <AdminAddButton label="Add Skill" onClick={openAddModal} />
        </div>
      </div>

      {error && !isModalOpen && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      {isLoading ? (
        <p>Loading skills...</p>
      ) : skills.length === 0 ? (
        <EmptyState message="No skills yet." actionLabel="Add Skill" onAction={openAddModal} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} onClick={() => setViewingSkill(skill)}>
                  <td>{skill.skill_name}</td>
                  <td>{skill.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && skills.length > 0 && (
        <div className="mobile-list">
          {skills.map((skill) => (
            <MobileAdminRow
              key={skill.id}
              onClick={() => setViewingSkill(skill)}
            >
              <span className="mobile-row-line1">{skill.skill_name}</span>
              <span className="mobile-row-line2">{skill.category}</span>
            </MobileAdminRow>
          ))}
        </div>
      )}

      <AdminDetailModal
        isOpen={Boolean(viewingSkill)}
        onClose={() => setViewingSkill(null)}
        title="Skill Details"
        fields={[
          { label: 'Skill', value: viewingSkill?.skill_name },
          { label: 'Category', value: viewingSkill?.category },
        ]}
        onEdit={viewingSkill ? () => openEditModal(viewingSkill) : undefined}
        onDelete={viewingSkill ? () => requestDelete(viewingSkill) : undefined}
      />

      <Modal isOpen={isModalOpen} onClose={closeModal} title={form.id ? 'Edit Skill' : 'Add Skill'}>
        <form onSubmit={handleSubmit} className="admin-form">
          <label htmlFor="skill-name">Skill Name</label>
          <input id="skill-name" name="skill_name" value={form.skill_name} onChange={handleChange} required />

          <label htmlFor="skill-category">Category</label>
          <select id="skill-category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : form.id ? 'Update Skill' : 'Add Skill'}
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
        title="Delete Skill"
        message="Are you sure you want to delete this skill? This action cannot be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}

export default ManageSkills
