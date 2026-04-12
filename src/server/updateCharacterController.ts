import bcrypt from 'bcryptjs'
import type { Character } from '../types/character'
import {
  checkNameAvailable,
  getCharacterByIdWithPassword,
  saveCharacter,
} from './db'
import { getSession } from './getSessionController'
import { deleteImageFromBlobStorage } from './imageRemover'

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
    throw new Error('Unauthorized: No active session found. Please log in to update a character.')
  }

  // Prevent editing another character
  if (sessionCharacterId !== data.id) {
    throw new Error('Unauthorized: Session character ID does not match the character to be updated. Please log in with the correct character to update it.')
  }

  // Fetch the existing character from the database
  const existingCharacter = await getCharacterByIdWithPassword(data.id)
  if (!existingCharacter) {
    throw new Error('Character not found. Please check the character ID and try again.')
  }

  // Check name availability (only if name changed)
  const available = await checkNameAvailable(data.name)
  if (!available && data.name !== existingCharacter.name) {
    throw new Error('Character name is already taken. Please choose a different name.')
  }

  // If a new image URL is provided and it's different from the existing one, delete the old image from blob storage
  if (
    existingCharacter.imageUrl &&
    data.imageUrl !== existingCharacter.imageUrl
  ) {
    const deleted = await deleteImageFromBlobStorage(existingCharacter.imageUrl)
    if (!deleted) {
      throw new Error('Failed to delete old character image from storage. Please try again.')
    }
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
