import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import type { Character } from '../types/character'
import { getCharacterByName } from '#/server/db'
import { Star, Swords, User } from 'lucide-react'

const getCharacterProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      characterName: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const character = await getCharacterByName(data.characterName)
    return character
  })

export interface CharacterProfileProps {
  characterName: string
}

export default function CharacterProfile({
  characterName,
}: CharacterProfileProps) {
  const getCharacterProfile = useServerFn(getCharacterProfileFn)

  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true)
        const data = await getCharacterProfile({ data: { characterName } })
        setCharacter(data)
      } catch (err) {
        console.error('Failed to fetch character', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCharacter()
  }, [characterName, getCharacterProfile])

  if (loading) return <div className='p-6 text-center text-parchment-foreground/70 text-sm font-body'>Loading...</div>
  if (!character) return <div className='p-6 text-center text-parchment-foreground/70 text-sm font-body'>Character not found</div>

  return (
    <div className="p-6 text-center">
      <div className="mt-6 flex flex-col items-center gap-4">
            {/* Portrait */}
            <div className="w-24 h-24 rounded-full border-2 border-parchment-foreground/30 overflow-hidden bg-parchment-foreground/10 flex items-center justify-center">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-parchment-foreground/40" />
              )}
            </div>

            <h2 className="font-quest text-xl text-parchment-foreground">{character.name}</h2>

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
          </div>
    </div>
  )
}