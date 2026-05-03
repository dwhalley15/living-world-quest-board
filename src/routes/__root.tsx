import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Living World Quest Board',
      },

      {
        name: 'description',
        content: 'Manage, track, and explore quests in a dynamic living world.',
      },
      {
        name: 'robots',
        content: 'index, follow',
      },
      {
        name: 'author',
        content: 'David Whalley',
      },
      {
        property: 'og:title',
        content: 'Living World Quest Board',
      },
      {
        property: 'og:description',
        content: 'Track quests, manage characters, and explore a living world.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://living-world-quest-board.vercel.app/',
      },
      {
        property: 'og:image',
        content:
          'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/quest-board-desktop.png',
      },

      // Twitter
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Living World Quest Board',
      },
      {
        name: 'twitter:description',
        content: 'Track quests and manage your characters in a dynamic world.',
      },
      {
        name: 'twitter:image',
        content:
          'https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/quest-board-desktop.png',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      // Standard favicon
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },

      // PNG favicons
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },

      // Apple
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },

      // Android
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        href: '/android-chrome-512x512.png',
      },

      // Web manifest
      {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    ],
  }),
  shellComponent: RootDocument,

  errorComponent: ({ error }: { error: Error }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-md shadow-xl"
        style={{
          backgroundImage:
            'url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/parchment.jpg)',
          backgroundSize: 'cover',
        }}
      >
        <div className="p-6">
          <h2 className="font-quest text-2xl text-parchment-foreground mb-2">
            Something went wrong
          </h2>

          <p className="text-sm text-parchment-foreground/70">
            {error.message || 'Unexpected error occurred'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 rounded border border-parchment-foreground/30 hover:bg-parchment-foreground/10 text-parchment-foreground"
          >
            Retry Quest
          </button>
        </div>
      </div>
    </div>
  ),

  // ✅ 404s (no matching route)
  notFoundComponent: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-md shadow-xl"
        style={{
          backgroundImage:
            'url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/parchment.jpg)',
          backgroundSize: 'cover',
        }}
      >
        <div className="p-6 text-center">
          <h2 className="font-quest text-2xl text-parchment-foreground mb-2">
            404 — Lost in the Realm
          </h2>

          <p className="text-sm text-parchment-foreground/70">
            This path does not exist in the world of quests.
          </p>

          <button
            onClick={() => (window.location.href = '/')}
            className="mt-6 px-4 py-2 rounded border border-parchment-foreground/30 hover:bg-parchment-foreground/10 text-parchment-foreground"
          >
            Return to Board
          </button>
        </div>
      </div>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className="min-h-screen relative grid grid-rows-[1fr_auto]"
        style={{
          backgroundImage:
            'url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/quest-board-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Vignette overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, hsl(30 15% 5% / 0.7) 100%)',
          }}
        />
        <main className="w-full">
          <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
