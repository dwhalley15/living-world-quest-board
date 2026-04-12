import { type CharacterWithPassword } from '../types/character'
import { getCharacterByName } from './db'
import { verifyPassword } from './verifyPassword'

export interface LoginResult {
  success: boolean
  message?: string
  character?: Omit<CharacterWithPassword, 'passwordHash'>
}

export async function loginCharacter(
  name: string,
  password: string
): Promise<LoginResult> {

  // Retrieve character from the database by name
  const character = await getCharacterByName(name)
  if (!character) return { success: false, message: 'Character not found' }

  // Verify the provided password against the stored password hash
  const passwordMatch = await verifyPassword(password, character.passwordHash)
  if (!passwordMatch) return { success: false, message: 'Invalid password' }

  const { passwordHash, ...safeCharacter } = character
  return { success: true, character: safeCharacter }
}