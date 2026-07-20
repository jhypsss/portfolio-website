import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import AdminAddButton from '../components/AdminAddButton'
import AdminDetailModal from '../components/AdminDetailModal'
import MobileAdminRow from '../components/MobileAdminRow'

const EMPTY_FORM = {
  id: null,
  title: '',
  description: '',
  tech_stack: '',
  image_url: '',
  live_url: '',
  github_url: '',
  is_featured: false,
}

function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewingProject, setViewingProject] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setProjects(data ?? [])
      }
      setIsLoading(false)
    }

    loadProjects()

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
    setImageFile(null)
    setError(null)
    setIsModalOpen(true)
  }

  function openEditModal(project) {
    setForm({ ...EMPTY_FORM, ...project })
    setImageFile(null)
    setError(null)
    setViewingProject(null)
    setIsModalOpen(true)
  }

  function requestDelete(project) {
    setViewingProject(null)
    setPendingDeleteId(project.id)
  }

  function closeModal() {
    setIsModalOpen(false)
    setForm(EMPTY_FORM)
    setImageFile(null)
  }

  async function uploadImage() {
    if (!imageFile) return form.image_url

    const filePath = `projects/${Date.now()}-${imageFile.name}`
    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, imageFile, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const imageUrl = await uploadImage()
      const payload = {
        title: form.title,
        description: form.description,
        tech_stack: form.tech_stack,
        image_url: imageUrl,
        live_url: form.live_url,
        github_url: form.github_url,
        is_featured: form.is_featured,
      }

      const { error: saveError } = form.id
        ? await supabase.from('projects').update(payload).eq('id', form.id)
        : await supabase.from('projects').insert(payload)

      if (saveError) throw saveError

      closeModal()
      setRefreshKey((key) => key + 1)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id)
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
        <h1>Manage Projects</h1>
        <div className="admin-toolbar-actions">
          <AdminAddButton label="Add Project" onClick={openAddModal} />
        </div>
      </div>

      {error && !isModalOpen && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      {isLoading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <EmptyState message="No projects yet." actionLabel="Add Project" onAction={openAddModal} />
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Featured</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} onClick={() => setViewingProject(project)}>
                  <td>{project.title}</td>
                  <td>{project.is_featured ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <div className="mobile-list">
          {projects.map((project) => (
            <MobileAdminRow
              key={project.id}
              onClick={() => setViewingProject(project)}
            >
              <span className="mobile-row-line1">{project.title}</span>
              <span className="mobile-row-line2">
                {project.tech_stack || (project.is_featured ? 'Featured' : 'Not featured')}
              </span>
            </MobileAdminRow>
          ))}
        </div>
      )}

      <AdminDetailModal
        isOpen={Boolean(viewingProject)}
        onClose={() => setViewingProject(null)}
        title="Project Details"
        fields={[
          { label: 'Title', value: viewingProject?.title },
          { label: 'Description', value: viewingProject?.description },
          { label: 'Tech Stack', value: viewingProject?.tech_stack },
          { label: 'Featured', value: viewingProject?.is_featured ? 'Yes' : 'No' },
          { label: 'Live URL', value: viewingProject?.live_url },
          { label: 'GitHub URL', value: viewingProject?.github_url },
        ]}
        onEdit={viewingProject ? () => openEditModal(viewingProject) : undefined}
        onDelete={viewingProject ? () => requestDelete(viewingProject) : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={form.id ? 'Edit Project' : 'Add Project'}
      >
        <form onSubmit={handleSubmit} className="admin-form">
          <label htmlFor="project-title">Title</label>
          <input id="project-title" name="title" value={form.title} onChange={handleChange} required />

          <label htmlFor="project-description">Description</label>
          <textarea
            id="project-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="project-tech-stack">Tech Stack</label>
          <input
            id="project-tech-stack"
            name="tech_stack"
            value={form.tech_stack}
            onChange={handleChange}
            placeholder="React, .NET, SQL Server"
          />

          <label htmlFor="project-image">Project Image</label>
          <input
            id="project-image"
            name="image"
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files[0] ?? null)}
          />

          <label htmlFor="project-live-url">Live URL</label>
          <input id="project-live-url" name="live_url" value={form.live_url} onChange={handleChange} />

          <label htmlFor="project-github-url">GitHub URL</label>
          <input id="project-github-url" name="github_url" value={form.github_url} onChange={handleChange} />

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_featured"
              checked={form.is_featured}
              onChange={handleChange}
            />
            Featured project
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : form.id ? 'Update Project' : 'Add Project'}
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
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </section>
  )
}

export default ManageProjects
