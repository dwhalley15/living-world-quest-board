import { createFileRoute } from '@tanstack/react-router'
import CharacterBar from '../components/CharacterBar'
import Modal from '../components/Modal'
import CreateCharacterForm from '#/components/Forms/CreateCharacterForm'
import CharacterLoginForm from '#/components/Forms/CharacterLoginForm'
import { useState } from 'react'
import { LogIn, Shield } from 'lucide-react'
import { getSession } from '../server/getSessionController'
import { createServerFn } from '@tanstack/react-start'
import type { Character } from '../types/character'
import { getCharacterById } from '../server/db'
import EditCharacterForm from '../components/Forms/UpdateCharacterForm'
import QuestBoard from '../components/QuestBoard'
import { getQuests } from '../server/getQuestsController'

const sessionLoader = createServerFn({ method: 'GET' }).handler(() => {
  return getSession()
})

const questLoader = createServerFn({ method: 'GET' }).handler(async () => {
    return getQuests()
})

export const Route = createFileRoute('/')({
  component: App,
  loader: async () => {
    const characterId = await sessionLoader()
    let activeCharacter: Character | null = null
    if (characterId) {
      const characterData = await getCharacterById(characterId)
      activeCharacter = characterData
    }
    const quests = await questLoader()
    return { activeCharacter, quests }
  },
})


function App() {
  const loaderData = Route.useLoaderData()
  const [activeCharacter, setActiveCharacter] = useState(loaderData.activeCharacter)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [charCreateOpen, setCharCreateOpen] = useState(false)
  const [quests, setQuests] = useState(loaderData.quests)

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <CharacterBar
        activeCharacter={activeCharacter}
        setActiveCharacter={setActiveCharacter} 
        editCharacterProfile={setEditProfileOpen}
        setLoginOpen={setLoginOpen}
        setCharCreateOpen={setCharCreateOpen}
      />

      <QuestBoard activeCharacter={activeCharacter} quests={quests} setQuests={setQuests} />

      <Modal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Character Profile"
        size="sm"
      >
        {activeCharacter && (
          <EditCharacterForm
            character={activeCharacter}
            onSuccess={async (character) => {
              setEditProfileOpen(false)
              setActiveCharacter(character)
            }}
          />
        )}
      </Modal>

      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Login"
        icon={LogIn}
        size="sm"
      >
        <CharacterLoginForm 
          onSuccess={async (character) => {
            setLoginOpen(false)
            setActiveCharacter(character)
          }}
        />
      </Modal>

      <Modal
        open={charCreateOpen}
        onClose={() => setCharCreateOpen(false)}
        title="Create Character"
        icon={Shield}
        size="md"
      >
        <CreateCharacterForm
          onSuccess={async (character) => {
            setCharCreateOpen(false)
            setActiveCharacter(character)
          }}
        />
      </Modal>
    </main>
  )
}
