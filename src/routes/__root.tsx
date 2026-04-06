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
