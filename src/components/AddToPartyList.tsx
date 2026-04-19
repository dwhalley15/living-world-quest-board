import type { Character } from '../types/character'
import type { Quest } from '../types/quest'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { addToParty } from '../server/addToPartyController'
import { z } from 'zod'

const addToPartyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string(),
      characterId: z.string(),
      activeCharacterId: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const updatedQuest = await addToParty(data.questId, data.characterId, data.activeCharacterId)
      return { success: true, updatedQuest: updatedQuest }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

interface AddToPartyListProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  characters: Character[]
  setShowAddToPartyModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AddToPartyList({
  quest,
  activeCharacter,
  setQuests,
  characters,
  setShowAddToPartyModal
}: AddToPartyListProps) {
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const addToPartyServer = useServerFn(addToPartyFn)

  const charactersNotInParty = useMemo(() => {
    const partyIds = new Set(
      quest.currentParty.map((c) => c.id).concat(quest.partyLeader?.id || []),
    )
    return characters.filter((char) => !partyIds.has(char.id))
  }, [characters, quest.currentParty, quest.partyLeader])

  const handleAddToParty = async(charId: string) => {
    setError(null)
    setLoadingId(charId)
    try {
      const result = await addToPartyServer({
        data: { questId: quest.id, characterId: charId, activeCharacterId: activeCharacter?.id || null },
      })
      if (!result.success && !result.updatedQuest) {
        setError('Failed to add character to party.')
        setLoadingId(null)
        return
      }

      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id
            ? {
                ...q,
                currentParty: [
                  ...q.currentParty,
                  characters.find((c) => c.id === charId)!,
                ],
              }
            : q,
        ),
      )
      setShowAddToPartyModal(false)
    } catch (error) {
      setError('An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="max-h-64 overflow-y-auto pr-2">
      {charactersNotInParty.map((char) => (
        <div key={char.id} className="flex items-center justify-between py-2">
          <span className="flex items-center gap-1.5 text-sm text-parchment-foreground/70 font-body">
            {char.name}
          </span>
          <button
            onClick={() => {
              handleAddToParty(char.id)
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border border-parchment-foreground/30 text-parchment-foreground font-display text-sm rounded transition-colors"
            disabled={loadingId === char.id}
          >
            <Plus className="w-3.5 h-3.5" />
            {loadingId === char.id ? 'Adding...' : 'Add to Party'}
          </button>
        </div>
      ))}

      {error && <p className="mt-2 text-xs text-red-500 font-body">{error}</p>}

      {charactersNotInParty.length === 0 && (
        <p className="text-xs text-parchment-foreground/40 font-body">
          All characters are already in the party.
        </p>
      )}
    </div>
  )
}
