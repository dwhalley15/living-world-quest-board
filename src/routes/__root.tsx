import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Footer from '../components/Footer'
import Header from '../components/Header'

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
        description:
          'A platform to manage and track quests in the Living World.',
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
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen relative"
        style={{
          backgroundImage: 'url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/quest-board-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: "fixed",
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
        <Header />
        {children}
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
