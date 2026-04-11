import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { useState } from 'react'
import QuestView from './QuestView'

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

  return (
    <>
      {!editing ? (
        <QuestView
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
        />
      ) : (
        {
          /* Quest editing form will be displayed here */
        }
      )}
    </>
  )
}
