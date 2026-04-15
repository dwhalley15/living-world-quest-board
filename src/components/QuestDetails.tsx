import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { useState } from 'react'
import QuestView from './QuestView'
import UpdateQuestForm from './Forms/UpdateQuestForm'
import { Pencil } from 'lucide-react'

interface QuestDetailsProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function QuestDetails({
  quest,
  activeCharacter,
  setQuests,
}: QuestDetailsProps) {
  const [editing, setEditing] = useState(false)

  const isGod = activeCharacter?.role === 'god'

  return (
    <>
      {!quest.isCompleted && !editing && isGod && (
        <button
          onClick={() => setEditing(true)}
          className="text-parchment-foreground/50 hover:text-parchment-foreground transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {!editing ? (
        <QuestView
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
        />
      ) : (
        <UpdateQuestForm
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
          setEditing={setEditing}
        />
      )}
    </>
  )
}
