import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, '.', '')
  let documentTitle = 'Portfolio'
  let documentDescription = 'Portfolio'

  if (env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(
        `${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/profile?select=full_name,short_intro&limit=1`,
        {
          headers: {
            apikey: env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
          },
        },
      )

      if (response.ok) {
        const [profile] = await response.json()
        if (profile?.full_name) documentTitle = `${profile.full_name} | Portfolio`
        if (profile?.full_name && profile?.short_intro) {
          documentDescription = `${profile.full_name} | ${profile.short_intro}`
        }
      }
    } catch {
      // Keep the static fallback when profile data is unavailable during a build.
    }
  }

  const escapedTitle = escapeHtml(documentTitle)
  const escapedDescription = escapeHtml(documentDescription)

  return {
    plugins: [
      react(),
      {
        name: 'database-document-title',
        transformIndexHtml(html) {
          return html
            .replace('<title>Portfolio</title>', `<title>${escapedTitle}</title>`)
            .replaceAll(
              'content="Portfolio" data-dynamic-title',
              `content="${escapedTitle}" data-dynamic-title`,
            )
            .replace(
              /(<meta[^>]*content=")Portfolio("[^>]*data-dynamic-description[^>]*>)/g,
              `$1${escapedDescription}$2`,
            )
        },
      },
    ],
  }
})
