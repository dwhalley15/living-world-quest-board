export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  imageUrl?: string;
}

export interface CharacterWithPassword extends Character {
  passwordHash: string
}

export const CHARACTER_CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
] as const;