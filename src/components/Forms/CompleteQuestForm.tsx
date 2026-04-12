import type { Character } from '#/types/character'
import type { Quest } from '#/types/quest'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useState } from 'react'
import { completeQuest } from '../../server/completeQuestController'

const completeQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      questId: z.string().min(1),
      activeCharacterId: z.string().min(1),
      completedMessage: z.string().min(1).max(500),
    }),
  )
  .handler(async ({ data }) => {
    const completedQuest = await completeQuest(
      data.questId,
      data.activeCharacterId,
      data.completedMessage,
    )
    return { success: true, completedQuest }
  })

interface CompleteQuestFormProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
}

export default function CompleteQuestForm({
  quest,
  activeCharacter,
  setQuests,
}: CompleteQuestFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const completeQuestMutation = useServerFn(completeQuestFn)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (!activeCharacter) {
      setError('No active character selected.')
      setLoading(false)
      return
    }
    try {
      await completeQuestMutation({
        data: {
          questId: quest.id,
          activeCharacterId: activeCharacter.id,
          completedMessage: message,
        },
      })
      setQuests((prevQuests) =>
        prevQuests.map((q) =>
          q.id === quest.id ? { ...q, isCompleted: true, completionMessage: message } : q,
        ),
      )
    } catch (err) {
      setError('Failed to complete quest.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        maxLength={500}
        className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40 resize-none"
        placeholder="Write a tale of your triumph..."
      />
      {error && <p className="text-red-500 text-sm font-body">{error}</p>}
      <button
        type="submit"
        className={`w-full py-2.5 border rounded text-parchment-foreground font-display text-sm transition-colors
                ${
                  loading
                    ? 'bg-parchment-foreground/10 border-parchment-foreground/20 text-parchment-foreground/50 cursor-not-allowed'
                    : 'bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border-parchment-foreground/30'
                }
            `}
        disabled={loading}
      >
        {loading ? 'Completing...' : 'Mark Complete'}
      </button>
    </form>
  )
}
