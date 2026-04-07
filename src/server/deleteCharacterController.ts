import { getSession } from './getSessionController'
import { deleteCharacterFromDb, getCharacterById } from './db'
import { destroySession } from './destroySessionController'
import { deleteImageFromBlobStorage } from './imageRemover'


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

    //Get character from database to check if it exists
    const character = await getCharacterById(id);
    if (!character) {
      throw new Error('Character not found')
    }

    //Delete image from blob storage if exists
    if(character.imageUrl){
      const deleted = await deleteImageFromBlobStorage(character.imageUrl)
      if (!deleted) {
        throw new Error('Failed to delete image from blob storage')
      }
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