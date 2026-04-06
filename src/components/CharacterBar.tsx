import type { Character } from '../types/character'
import { LogOut, User } from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { destroySession } from '#/server/destroySessionController'
import { useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import Modal from './Modal'

interface CharacterBarProps {
  activeCharacter: Character | null
  setActiveCharacter: React.Dispatch<React.SetStateAction<Character | null>>
  editCharacterProfile: React.Dispatch<React.SetStateAction<boolean>>
  setLoginOpen: React.Dispatch<React.SetStateAction<boolean>>
  setCharCreateOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const success = await destroySession()
  return { success }
})

export default function CharacterBar({
  activeCharacter,
  setActiveCharacter,
  editCharacterProfile,
  setLoginOpen,
  setCharCreateOpen,
}: CharacterBarProps) {
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

  const logout = useServerFn(logoutFn)

  const router = useRouter()

  async function handleLogout() {
    if (!activeCharacter) return
    await logout()
    setActiveCharacter(null)
    router.invalidate()
  }

  return (
    <section className="flex items-center justify-end mb-4 gap-2">
      {activeCharacter ? (
        <>
          <button
            onClick={() => editCharacterProfile(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-foreground/70 hover:text-foreground text-sm font-display transition-colors"
          >
            <User className="w-4 h-4" />
            {activeCharacter.name}
            <span className="text-foreground/40">
              Lv.{activeCharacter.level} {activeCharacter.class}
            </span>
          </button>
          <button
            onClick={() => setConfirmLogoutOpen(true)}
            className="text-foreground/40 hover:text-foreground/60 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <Modal
            open={confirmLogoutOpen}
            onClose={() => setConfirmLogoutOpen(false)}
            title="Leaving?"
            size="sm"
            icon={LogOut}
          >
            <div className="space-y-4">
              <p className="text-sm text-parchment-foreground/80">
                Are you sure you want to leave your fellow adventurers?
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    await handleLogout()
                    setConfirmLogoutOpen(false)
                  }}
                  className="px-3 py-1.5 border border-parchment-foreground/30 rounded text-sm text-parchment-foreground/80 hover:bg-parchment-foreground/80 hover:text-foreground transition-colors"
                >
                  Yes
                </button>

                <button
                  onClick={() => setConfirmLogoutOpen(false)}
                  className="px-3 py-1.5 border border-parchment-foreground/30 rounded text-sm text-parchment-foreground/80 hover:bg-parchment-foreground/80 hover:text-foreground transition-colors"
                >
                  No
                </button>

                
              </div>
            </div>
          </Modal>
        </>
      ) : (
        <>
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-display text-sm rounded transition-colors"
          >
            <User className="w-4 h-4" />
            Login
          </button>
          <button
            onClick={() => setCharCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-display text-sm rounded transition-colors"
          >
            <User className="w-4 h-4" />
            Create Character
          </button>
        </>
      )}
    </section>
  )
}
