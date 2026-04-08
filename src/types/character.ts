export interface Character {
  id: string
  name: string
  class: string
  level: number
  role: CharacterRole
  imageUrl?: string
}

export interface CharacterWithPassword extends Character {
  passwordHash: string
}

export type CharacterRole = 'player' | 'god'

export const CHARACTER_CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
] as const
