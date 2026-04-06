import { createFileRoute } from '@tanstack/react-router'
import { put } from '@vercel/blob'

export const Route = createFileRoute('/api/imageUploader')(
  {
    server: {
      handlers: {
        POST: async ({ request }: { request: Request }) => {
          try {
            const formData = await request.formData()
            const file = formData.get('file') as File | null

            if (!file) {
              return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              })
            }

            const uniqueName = `quest-board/${file.name}-${Date.now()}`
            const { url } = await put(uniqueName, file, { access: 'public' })

            return new Response(JSON.stringify({ url }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          } catch (err: any) {
            return new Response(
              JSON.stringify({ error: err.message || 'Server error' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
          }
        },
      },
    },
  } as any
)