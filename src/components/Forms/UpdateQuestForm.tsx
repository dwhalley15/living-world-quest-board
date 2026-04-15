import type { Character } from '../../types/character'
import type { Quest } from '../../types/quest'
import { useState } from 'react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { updateQuest } from '../../server/updateQuestController'
import { XCircle } from 'lucide-react'

const updateQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      partySize: z
        .number()
        .min(1, 'Party size must be at least 1')
        .max(20, 'Party size cannot exceed 20'),
      location: z.string().min(1, 'Location is required'),
      activeCharacterId: z.string().min(1, 'Active character is required'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const updatedQuest = await updateQuest(data)
      return { success: true, quest: updatedQuest }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

interface UpdateQuestFormProps {
  quest: Quest
  activeCharacter: Character | null
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
}

export default function UpdateQuestForm({
  quest,
  activeCharacter,
  setQuests,
  setEditing,
}: UpdateQuestFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState(quest.title)
  const [description, setDescription] = useState(quest.description)
  const [partySize, setPartySize] = useState(quest.partySize)
  const [location, setLocation] = useState(quest.location)

  const updateQuestFnClient = useServerFn(updateQuestFn)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!activeCharacter) {
      setError('You must be logged in to edit a quest')
      setLoading(false)
      return
    }
    try {
      const result = await updateQuestFnClient({
        data: {
          id: quest.id,
          title,
          description,
          partySize,
          location,
          activeCharacterId: activeCharacter.id,
        },
      })

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      setQuests((prevQuests) =>
        prevQuests.map((q) =>
          q.id === quest.id ? { ...q, ...result.quest } : q,
        ),
      )
        setEditing(false)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40'

  return (
    <>
    <button className="text-parchment-foreground/50 hover:text-parchment-foreground transition-colors" onClick={() => setEditing(false)}>
        <XCircle className="w-4 h-4" />
    </button>
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Quest Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} font-quest text-xl`}
        />
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
            Party Size
          </label>
          <input
            type="number"
            min={1}
            max={20}
            required
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body focus:outline-none focus:border-parchment-foreground/40"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Location
        </label>
        <input
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40"
          placeholder="The Forgotten Ruins..."
        />
      </div>

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
        {loading ? 'Updating...' : 'Update Quest'}
      </button>
    </form>
    </>
  )
}
