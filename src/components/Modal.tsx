import { X, type LucideIcon } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  icon?: LucideIcon
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className={`relative ${sizeMap[size]} w-full overflow-hidden rounded-md shadow-xl`}
        style={{
          backgroundImage: `url(https://frw6rziicw61rtm1.public.blob.vercel-storage.com/quest-board/parchment.jpg)`,
          backgroundSize: 'cover',
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="font-quest text-2xl text-parchment-foreground flex items-center gap-2">
              {Icon && (
                <Icon className="w-5 h-5 text-parchment-foreground/80" />
              )}

              <h2>{title}</h2>
            </div>

            <button
              onClick={onClose}
              className="text-parchment-foreground/70 hover:text-parchment-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
