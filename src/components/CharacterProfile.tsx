import type { Quest } from '#/types/quest'
import { useState } from 'react'
import type { Character } from '../types/character'
import { Star, Swords, User, UserMinus } from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { removeFromParty } from '../server/removeFromPartyController'

const removeFromPartyFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string(),
      characterId: z.string(),
      activeCharacterId: z.string().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const updatedQuest = await removeFromParty(
        data.questId,
        data.characterId,
        data.activeCharacterId,
      )
      return { success: true, quest: updatedQuest }
    } catch (err) {
      return {
        success: false,
        message: 'Failed to remove character from party.',
      }
    }
  })

export interface CharacterProfileProps {
  character: Character
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  setShowCharacterModal: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CharacterProfile({
  character,
  quest,
  activeCharacter,
  setShowCharacterModal,
  setQuests,
}: CharacterProfileProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const removeFromPartyServer = useServerFn(removeFromPartyFn)

  const isLeader = quest.partyLeader?.id === activeCharacter?.id

  const isGod = activeCharacter?.role?.toLowerCase() === 'god'

  const isCurrentUser = character.id === activeCharacter?.id

  const isInParty =
    quest.currentParty.some((c) => c.id === character.id) || isLeader

  const handleRemoveFromParty = async () => {
    if (!isLeader && !isGod) {
      setError('Only the party leader or a character with the God role can remove members.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await removeFromPartyServer({
        data: {
          questId: quest.id,
          characterId: character.id,
          activeCharacterId: activeCharacter?.id || null,
        },
      })
      if (!result.success && !result.quest) {
        setError('Failed to remove character from party.')
        return
      }

      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? result.quest : q)),
      )

      setShowCharacterModal(false)
    } catch (err) {
      setError('Failed to remove character from party. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 text-center">
      <div className="mt-6 flex flex-col items-center gap-4">
        {/* Portrait */}
        <div className="w-24 h-24 rounded-full border-2 border-parchment-foreground/30 overflow-hidden bg-parchment-foreground/10 flex items-center justify-center">
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-parchment-foreground/40" />
          )}
        </div>

        <h2 className="font-quest text-xl text-parchment-foreground">
          {character.name}
        </h2>

        <div className="flex items-center gap-4 text-parchment-foreground/70 text-sm font-body">
          <div className="flex items-center gap-1.5">
            <Swords className="w-4 h-4" />
            <span>{character.class}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            <span>Level {character.level}</span>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="w-32 h-px bg-parchment-foreground/20 my-2" />

        <p className="text-xs italic text-parchment-foreground/40 font-body">
          "Fortune favors the bold."
        </p>

        {error && (
          <p className="mt-2 text-xs text-red-500 font-body">{error}</p>
        )}

        {!isCurrentUser && isInParty && (isLeader || isGod) && (
          <button
            className="flex items-center gap-1 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 font-display text-xs rounded transition-colors"
            onClick={() => handleRemoveFromParty()}
            disabled={loading}
          >
            <UserMinus className="w-3.5 h-3.5" />
            {loading ? 'Removing...' : 'Remove from Party'}
          </button>
        )}
      </div>
    </div>
  )
}
