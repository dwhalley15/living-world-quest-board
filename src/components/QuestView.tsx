import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { Calendar, CheckCircle2, MapPin, Swords, User } from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { joinQuest } from '#/server/joinQuestController'
import { useState } from 'react'
import Modal from './Modal'
import CharacterProfile from './CharacterProfile'

const joinQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string().min(1),
      activeCharacterId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await joinQuest(data.questId, data.activeCharacterId)
    return { success: true }
  })

interface QuestViewProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function QuestView({
  quest,
  activeCharacter,
  setQuests,
}: QuestViewProps) {
  const [error, setError] = useState<string | null>(null)
  const [showCharacterModal, setShowCharacterModal] = useState(false)
  const [selectedCharacterName, setSelectedCharacterName] = useState<
    string | null
  >(null)
  const isGod = activeCharacter?.role === 'god'
  const hasParty = quest.currentParty.length > 0
  const formattedDate = new Date(quest.dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const joinQuestServer = useServerFn(joinQuestFn)

  const joinQuest = () => {
    if (!activeCharacter) return
    if (hasParty) {
      setError('This quest is already full.')
      return
    }
    try {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id !== quest.id) return q
          if (q.currentParty.includes(activeCharacter.name)) return q
          return {
            ...q,
            currentParty: [...q.currentParty, activeCharacter.name],
          }
        }),
      )
      joinQuestServer({
        data: { questId: quest.id, activeCharacterId: activeCharacter.id },
      })
    } catch (err) {
      setError('Failed to join quest. Please try again.')
      return
    }
  }

  return (
    <>
      <div className="flex flex-col items-start justify-between">
        {quest.isCompleted && (
          <div className="flex items-center gap-1.5 mt-2 text-green-800/70 text-sm font-display">
            <CheckCircle2 className="w-4 h-4" />
            Quest Completed
          </div>
        )}

        {/* Description */}
        <div className="mt-4">
          <h4 className="text-xs font-display text-parchment-foreground/50 uppercase tracking-wider mb-1">
            Description
          </h4>
          <p className="text-parchment-foreground/80 font-body text-sm leading-relaxed">
            {quest.description}
          </p>
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-3">
            {quest.isCompleted && (
          <div>
            <h4 className="text-xs font-display text-parchment-foreground/50 uppercase tracking-wider mb-1">
              Date & Time
            </h4>
            <div className="flex items-center gap-1.5 text-sm text-parchment-foreground/70 font-body">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
            )}
          <div>
            <h4 className="text-xs font-display text-parchment-foreground/50 uppercase tracking-wider mb-1">
              Location
            </h4>

            <div className="flex items-center gap-1.5 text-sm text-parchment-foreground/70 font-body">
              <MapPin className="w-3.5 h-3.5" />
              <span>{quest.location}</span>
            </div>
          </div>
        </div>

        {/* Party Members */}
        <div className="mt-4">
          <h4 className="text-xs font-display text-parchment-foreground/50 uppercase tracking-wider mb-2">
            Party ({quest.currentParty.length}/{quest.partySize})
          </h4>
          <div className="flex flex-wrap gap-2">
            {quest.currentParty.map((member) => (
              <button
                key={member}
                onClick={() => {
                  setSelectedCharacterName(member)
                  setShowCharacterModal(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 rounded text-parchment-foreground text-xs font-display transition-colors cursor-pointer"
              >
                <User className="w-3 h-3" />
                {member}
              </button>
            ))}
            {quest.currentParty.length === 0 && (
              <p className="text-xs italic text-parchment-foreground/40 font-body">
                No adventurers have claimed this quest yet...
              </p>
            )}
          </div>
        </div>

        {/* Posted by */}
        <div className="mt-4 pt-3 border-t border-parchment-foreground/10">
          <p className="text-xs text-parchment-foreground/40 font-body">
            Posted by{' '}
            <span className="font-display text-parchment-foreground/60">
              {quest.createdByName}
            </span>
          </p>
        </div>

        {/* Completion message */}
        {quest.isCompleted && quest.completionMessage && (
          <div className="mt-3 p-3 bg-parchment-foreground/5 rounded border border-parchment-foreground/10">
            <h4 className="text-xs font-display text-parchment-foreground/50 uppercase tracking-wider mb-1">
              Tale of Triumph
            </h4>
            <p className="text-sm italic text-parchment-foreground/60 font-body">
              "{quest.completionMessage}"
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-500 font-body">{error}</p>
        )}

        <div className="mt-5 flex gap-2">
          {!quest.isCompleted && activeCharacter && (
            <>
              {!hasParty && (
                <button
                  onClick={() => {
                    joinQuest()
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border border-parchment-foreground/30 text-parchment-foreground font-display text-sm rounded transition-colors"
                >
                  <Swords className="w-3.5 h-3.5" />
                  Take Quest
                </button>
              )}

              {isGod && (
                <button
                  onClick={() => {
                    /* Complete quest logic here */
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border border-parchment-foreground/30 text-parchment-foreground font-display text-sm rounded transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Quest
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        title="Character Profile"
        open={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        size="sm"
      >
        {selectedCharacterName && (
          <CharacterProfile characterName={selectedCharacterName} />
        )}
      </Modal>
    </>
  )
}
