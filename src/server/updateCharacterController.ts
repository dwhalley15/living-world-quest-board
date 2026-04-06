import bcrypt from 'bcryptjs'
import type { Character } from '../types/character'
import {
  checkNameAvailable,
  getCharacterByIdWithPassword,
  saveCharacter,
} from './db'
import { getSession } from './getSessionController'

interface UpdateCharacterData {
  id: string
  name: string
  charClass: string
  level: number
  password?: string
  imageUrl?: string
}

export async function updateCharacter(
  data: UpdateCharacterData,
): Promise<Character> {

  // Validate session
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId) {
    throw new Error('Not authenticated')
  }

  // Prevent editing another character
  if (sessionCharacterId !== data.id) {
    throw new Error('Unauthorized')
  }

  // Fetch the existing character from the database
  const existingCharacter = await getCharacterByIdWithPassword(data.id)
  if (!existingCharacter) {
    throw new Error('Character not found')
  }

  // Check name availability (only if name changed)
  const available = await checkNameAvailable(data.name)
  if (!available && data.name !== existingCharacter.name) {
    throw new Error('Character name is already taken')
  }

  // Build updated object
  const updatedCharacter = {
    ...existingCharacter,
    name: data.name,
    class: data.charClass,
    level: data.level,
    imageUrl: data.imageUrl ?? existingCharacter.imageUrl,
    passwordHash: data.password
      ? await bcrypt.hash(data.password, 10)
      : existingCharacter.passwordHash,
  }

  // Save updated character to database
  const savedCharacter = await saveCharacter(updatedCharacter)

  return savedCharacter
}
