import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import TechStackSettings from './TechStackSettings'

const EMPTY_FORM = {
  id: null,
  full_name: '',
  job_title: '',
  short_intro: '',
  about_me: '',
  resume_url: '',
  profile_image_url: '',
}

function ProfileSettings() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [photoFile, setPhotoFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      const { data, error: fetchError } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else if (data) {
        setForm({ ...EMPTY_FORM, ...data })
      }
      setIsLoading(false)
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function uploadFile(file, folder) {
    if (!file) return null

    const filePath = `${folder}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('portfolio-assets')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const profileImageUrl = (await uploadFile(photoFile, 'profile')) ?? form.profile_image_url
      const resumeUrl = (await uploadFile(resumeFile, 'resume')) ?? form.resume_url

      const payload = {
        full_name: form.full_name,
        job_title: form.job_title,
        short_intro: form.short_intro,
        about_me: form.about_me,
        resume_url: resumeUrl,
        profile_image_url: profileImageUrl,
        updated_at: new Date().toISOString(),
      }

      const { data: savedRow, error: saveError } = form.id
        ? await supabase.from('profile').update(payload).eq('id', form.id).select().maybeSingle()
        : await supabase.from('profile').insert(payload).select().maybeSingle()

      if (saveError) throw saveError

      setForm((prev) => ({ ...prev, ...savedRow, resume_url: resumeUrl, profile_image_url: profileImageUrl }))
      setPhotoFile(null)
      setResumeFile(null)
      setSuccessMessage('Profile updated successfully.')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="admin-manage">
        <h1>Profile Settings</h1>
        <p>Loading profile...</p>
      </section>
    )
  }

  return (
    <section className="admin-manage">
      <h1>Profile Settings</h1>

      <form onSubmit={handleSubmit} className="admin-form">
        <label htmlFor="profile-full-name">Full Name</label>
        <input
          id="profile-full-name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />

        <label htmlFor="profile-job-title">Job Title</label>
        <input id="profile-job-title" name="job_title" value={form.job_title} onChange={handleChange} />

        <label htmlFor="profile-short-intro">Short Intro</label>
        <input
          id="profile-short-intro"
          name="short_intro"
          value={form.short_intro}
          onChange={handleChange}
        />

        <label htmlFor="profile-about-me">About Me</label>
        <textarea
          id="profile-about-me"
          name="about_me"
          rows={5}
          value={form.about_me}
          onChange={handleChange}
        />

        <label htmlFor="profile-photo">Profile Photo</label>
        {form.profile_image_url && (
          <img src={form.profile_image_url} alt="Current profile" className="admin-preview-photo" />
        )}
        <input
          id="profile-photo"
          name="photo"
          type="file"
          accept="image/*"
          onChange={(event) => setPhotoFile(event.target.files[0] ?? null)}
        />

        <label htmlFor="profile-resume">Resume (PDF)</label>
        {form.resume_url && (
          <a href={form.resume_url} target="_blank" rel="noreferrer">
            View current resume
          </a>
        )}
        <input
          id="profile-resume"
          name="resume"
          type="file"
          accept="application/pdf"
          onChange={(event) => setResumeFile(event.target.files[0] ?? null)}
        />

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {successMessage && <p role="status">{successMessage}</p>}
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
      </form>

      <TechStackSettings />
    </section>
  )
}

export default ProfileSettings
