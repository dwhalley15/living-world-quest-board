import { getSession } from './getSessionController'
import { deleteCharacterFromDb, getCharacterById } from './db'
import { destroySession } from './destroySessionController'
import { deleteImageFromBlobStorage } from './imageRemover'


export async function deleteCharacter(id: string) {
    // Validate session
    const sessionCharacterId = await getSession()
    if (!sessionCharacterId) {
      return Promise.reject(new Error('Unauthorized: No active session found. Please log in to delete your character.'))
    }

    // Prevent deleting another character
    if (sessionCharacterId !== id) {
      return Promise.reject(new Error('Unauthorized: Character ID does not match active session. Please log in with the correct character to delete.'))
    }

    //Get character from database to check if it exists
    const character = await getCharacterById(id);
    if (!character) {
      return Promise.reject(new Error('Character not found. Please ensure the character ID is correct and try again.'))
    }

    //Delete image from blob storage if exists
    if(character.imageUrl){
      const deleted = await deleteImageFromBlobStorage(character.imageUrl)
      if (!deleted) {
        return Promise.reject(new Error('Failed to delete image from blob storage. Please try again.'))
      }
    }

    // Here you would add the logic to delete the character from the database
    const result = await deleteCharacterFromDb(id)
    if (!result) {
      return Promise.reject(new Error('Failed to delete character. Please try again.'))
    }

    // Destroy the session after deleting the character
    const resultDestroySession = await destroySession()
    if (!resultDestroySession) {
      return Promise.reject(new Error('Failed to destroy session after deleting character. Please try again.'))
    }

    return { success: true }
}