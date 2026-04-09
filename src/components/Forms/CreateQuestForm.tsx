import type { Quest } from '#/types/quest'
import { useState } from 'react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Character } from '#/types/character'
import { createQuest } from '#/server/createQuestController'

interface CreateQuestFormProps {
  onSuccess?: (quest: Quest) => void
  activeCharacter: Character | null
}

const createQuestFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().min(1, 'Description is required'),
      dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date and time',
      }),
      partySize: z
        .number()
        .int()
        .min(1, 'Party size must be at least 1')
        .max(20, 'Party size cannot exceed 20'),
      location: z.string().min(1, 'Location is required'),
      creatorId: z.string(),
      rotation: z
        .number()
        .int()
        .min(-2, 'Rotation must be between -2 and 2')
        .max(2, 'Rotation must be between -2 and 2'),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const newQuest = await createQuest(data)
      return { success: true, quest: newQuest }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

export default function CreateQuestForm({
  onSuccess,
  activeCharacter,
}: CreateQuestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 1)
    return d.toISOString().slice(0, 16)
  })
  const [partySize, setPartySize] = useState(1)
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createQuest = useServerFn(createQuestFn)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!activeCharacter) {
      setError('You must be logged in to create a quest')
      setLoading(false)
      return
    }
    try {
      const response = await createQuest({
        data: {
          title,
          description,
          dateTime,
          partySize,
          location,
          creatorId: activeCharacter?.id,
          rotation: getRotation(),
        },
      })
      if (response.success) {
        onSuccess && onSuccess(response.quest)
      } else {
        setError(response.message || 'Failed to create quest')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the quest')
    } finally {
      setLoading(false)
    }
  }

  function getRotation() {
    const rotations = [-2, -1.5, -1, 0, 1, 1.5, 2]
    const index = Math.floor(Math.random() * rotations.length)
    return rotations[index]
  }

  function getMinDateTime() {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Quest Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40"
          placeholder="Slay the Dragon of Ember Peak..."
        />
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Description
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40 resize-none"
          placeholder="A fearsome dragon has been spotted..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            required
            value={dateTime}
            min={getMinDateTime()}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body focus:outline-none focus:border-parchment-foreground/40"
          />
        </div>
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
        {loading ? 'Pinning...' : 'Pin to Board'}
      </button>
    </form>
  )
}
