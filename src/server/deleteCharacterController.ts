import { getSession } from './getSessionController'
import { deleteCharacterFromDb } from './db'
import { destroySession } from './destroySessionController'


export async function deleteCharacter(id: string) {
    // Validate session
    const sessionCharacterId = await getSession()
    if (!sessionCharacterId) {
      throw new Error('Not authenticated')
    }

    // Prevent deleting another character
    if (sessionCharacterId !== id) {
      throw new Error('Unauthorized')
    }

    // Here you would add the logic to delete the character from the database
    const result = await deleteCharacterFromDb(id)
    if (!result) {
      throw new Error('Failed to delete character')
    }

    // Destroy the session after deleting the character
    const resultDestroySession = await destroySession()
    if (!resultDestroySession) {
      throw new Error('Failed to destroy session')
    }

    return { success: true }
}