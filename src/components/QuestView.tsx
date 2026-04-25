import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import {
  Calendar,
  CheckCircle2,
  Crown,
  MapPin,
  Swords,
  User,
  UserPlus,
  CircleOff,
} from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { claimQuest } from '#/server/claimQuestController'
import { useMemo, useState } from 'react'
import Modal from './Modal'
import CharacterProfile from './CharacterProfile'
import { unclaimQuest } from '#/server/unclaimQuestController'
import CompleteQuestForm from './Forms/CompleteQuestForm'
import AddToPartyList from './AddToPartyList'
import { uncompleteQuest } from '../server/uncompleteQuestController'

const claimQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string().min(1),
      activeCharacterId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const claimedQuest = await claimQuest(
        data.questId,
        data.activeCharacterId,
      )
      return { success: true, claimedQuest }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

const unclaimQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string().min(1),
      activeCharacterId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const quest = await unclaimQuest(data.questId, data.activeCharacterId)
      return { success: true, quest }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

const uncompleteQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string().min(1),
      activeCharacterId: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const quest = await uncompleteQuest(data.questId, data.activeCharacterId)
      return { success: true, quest }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  })

interface QuestViewProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  characters: Character[]
}

export default function QuestView({
  quest,
  activeCharacter,
  setQuests,
  characters,
}: QuestViewProps) {
  const [error, setError] = useState<string | null>(null)
  const [showCharacterModal, setShowCharacterModal] = useState(false)
  const [showCompleteQuestModal, setShowCompleteQuestModal] = useState(false)
  const [showAddToPartyModal, setShowAddToPartyModal] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  )
  const [showUncompletedQuestModal, setShowUncompletedQuestModal] =
    useState(false)

  const isGod = activeCharacter?.role === 'god'
  const isClaimed = quest.partyLeader !== null
  const formattedDate = new Date(quest.dateTime).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const fullParty = useMemo(
    () => quest.currentParty.length + (quest.partyLeader ? 1 : 0),
    [quest.currentParty.length, quest.partyLeader],
  )

  const isLeader = quest.partyLeader?.id === activeCharacter?.id

  const claimQuestServer = useServerFn(claimQuestFn)

  const unclaimQuestServer = useServerFn(unclaimQuestFn)

  const uncompleteQuestServer = useServerFn(uncompleteQuestFn)

  const claimQuest = async () => {
    if (!activeCharacter) return
    if (isClaimed) {
      setError('This quest has already been claimed.')
      return
    }
    try {
      const result = await claimQuestServer({
        data: { questId: quest.id, activeCharacterId: activeCharacter.id },
      })
      if (!result.success && !result.claimedQuest) {
        setError('Failed to claim quest. Please try again.')
        return
      }

      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? result.claimedQuest : q)),
      )
    } catch (err) {
      setError('Failed to claim quest. Please try again.')
    }
  }

  const unclaimQuest = async () => {
    if (!activeCharacter) return

    try {
      const result = await unclaimQuestServer({
        data: {
          questId: quest.id,
          activeCharacterId: activeCharacter.id,
        },
      })

      if (!result.success && !result.quest) {
        setError('Failed to unclaim quest.')
        return
      }

      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? result.quest : q)),
      )
    } catch {
      setError('Failed to unclaim quest.')
    }
  }

  const handleUncompleteQuest = async () => {
    if (!activeCharacter) return

    try {
      const result = await uncompleteQuestServer({
        data: {
          questId: quest.id,
          activeCharacterId: activeCharacter.id,
        },
      })

      if (!result.success && !result.quest) {
        setError('Failed to unresolve quest.')
        return
      }

      setQuests((prev) =>
        prev.map((q) => (q.id === quest.id ? result.quest : q)),
      )
    } catch {
      setError('Failed to unresolve quest.')
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
            Party ({fullParty}/{quest.partySize})
          </h4>
          <div className="flex flex-wrap gap-2">
            {quest.partyLeader && (
              <button
                onClick={() => {
                  setSelectedCharacter(quest.partyLeader!)
                  setShowCharacterModal(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded text-xs font-display text-parchment-foreground transition-colors"
              >
                <Crown className="w-3 h-3" />
                {quest.partyLeader.name}
              </button>
            )}
            {quest.currentParty.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedCharacter(member)
                  setShowCharacterModal(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 rounded text-parchment-foreground text-xs font-display transition-colors cursor-pointer"
              >
                <User className="w-3 h-3" />
                {member.name}
              </button>
            ))}
            {fullParty < quest.partySize &&
              isLeader &&
              !quest.isCompleted &&
              isClaimed && (
                <button
                  onClick={() => setShowAddToPartyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 rounded text-parchment-foreground text-xs font-display transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3" />
                  Add Adventurer
                </button>
              )}
            {fullParty === 0 && (
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
              {!isClaimed && (
                <button
                  onClick={claimQuest}
                  className="flex items-center gap-1.5 px-4 py-2 bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border border-parchment-foreground/30 text-parchment-foreground font-display text-sm rounded transition-colors"
                >
                  <Swords className="w-3.5 h-3.5" />
                  Claim Quest
                </button>
              )}
              {isLeader && (
                <button
                  onClick={unclaimQuest}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 font-display text-sm rounded transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 rotate-180" />
                  Unclaim Quest
                </button>
              )}

              {isGod && !quest.isCompleted && (
                <button
                  onClick={() => {
                    setShowCompleteQuestModal(true)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border border-parchment-foreground/30 text-parchment-foreground font-display text-sm rounded transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete Quest
                </button>
              )}
            </>
          )}

          {/* Un-Complete Quest */}
          {isGod && quest.isCompleted && (
            <button
              onClick={() => {
                setShowUncompletedQuestModal(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 font-display text-sm rounded transition-colors"
            >
              <CircleOff className="w-3.5 h-3.5" />
              Unresolve Quest
            </button>
          )}
        </div>
      </div>

      <Modal
        title="Character Profile"
        open={showCharacterModal}
        onClose={() => setShowCharacterModal(false)}
        size="sm"
      >
        {selectedCharacter && (
          <CharacterProfile
            character={selectedCharacter}
            quest={quest}
            activeCharacter={activeCharacter}
            setQuests={setQuests}
            setShowCharacterModal={setShowCharacterModal}
          />
        )}
      </Modal>

      <Modal
        title="Complete Quest"
        open={showCompleteQuestModal}
        onClose={() => setShowCompleteQuestModal(false)}
        size="sm"
      >
        <CompleteQuestForm
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
        />
      </Modal>

      <Modal
        title="Add to Party"
        icon={UserPlus}
        open={showAddToPartyModal}
        onClose={() => setShowAddToPartyModal(false)}
        size="sm"
      >
        <AddToPartyList
          quest={quest}
          activeCharacter={activeCharacter}
          setQuests={setQuests}
          characters={characters}
          setShowAddToPartyModal={setShowAddToPartyModal}
        />
      </Modal>

      <Modal
        title="Unresold Quest"
        open={showUncompletedQuestModal}
        onClose={() => setShowUncompletedQuestModal(false)}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-parchment-foreground/80">
            Are you sure you want to unresolve {quest.title}?
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                await handleUncompleteQuest()
                setShowUncompletedQuestModal(false)
              }}
              className="px-3 py-1.5 border border-red-500/40 rounded text-sm text-red-500 hover:bg-red-500/10"
            >
              Yes, Unresolve
            </button>

            <button
              onClick={() => setShowUncompletedQuestModal(false)}
              className="px-3 py-1.5 border border-red-500/40 rounded text-sm text-red-500 hover:bg-red-500/10"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
