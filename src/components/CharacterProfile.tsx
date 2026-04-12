import type { Character } from '../types/character'
import { Star, Swords, User } from 'lucide-react'

export interface CharacterProfileProps {
  character: Character
}

export default function CharacterProfile({
  character,
}: CharacterProfileProps) {

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