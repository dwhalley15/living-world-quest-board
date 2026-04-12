import { getSession } from './getSessionController'
import { deleteCharacterFromDb, getCharacterById } from './db'
import { destroySession } from './destroySessionController'
import { deleteImageFromBlobStorage } from './imageRemover'


export async function deleteCharacter(id: string) {
    // Validate session
    const sessionCharacterId = await getSession()
    if (!sessionCharacterId) {
      throw new Error('Unauthorized: No active session found. Please log in to delete a character.')
    }

    // Prevent deleting another character
    if (sessionCharacterId !== id) {
      throw new Error('Unauthorized: Session character ID does not match the character to be deleted. Please log in with the correct character to delete it.')
    }

    //Get character from database to check if it exists
    const character = await getCharacterById(id);
    if (!character) {
      throw new Error('Character not found. Please check the character ID and try again.')
    }

    //Delete image from blob storage if exists
    if(character.imageUrl){
      const deleted = await deleteImageFromBlobStorage(character.imageUrl)
      if (!deleted) {
        throw new Error('Failed to delete character image from storage. Please try again.')
      }
    }

    // Here you would add the logic to delete the character from the database
    const result = await deleteCharacterFromDb(id)
    if (!result) {
      throw new Error('Failed to delete character from database. Please try again.')
    }

    // Destroy the session after deleting the character
    const resultDestroySession = await destroySession()
    if (!resultDestroySession) {
      throw new Error('Failed to destroy session after deleting character. Please try again.')
    }

    return { success: true }
}