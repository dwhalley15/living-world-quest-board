import { getSession } from './getSessionController'
import { deleteQuestFromDb, getQuestByIdFromDb, getRoleById,  } from './db'

export async function deleteQuest(characterId: string, questId: string) {
  // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== characterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

  // Check if quest is already completed
  const isCompleted = await getQuestByIdFromDb(questId)
  if (isCompleted?.is_completed) {
    throw new Error('This quest has already been completed.')
  }

  // Check if character has god role
  const role = await getRoleById(characterId)
  if (!role || role.toLowerCase() !== 'god') {
    throw new Error('Only characters with the God role can complete quests.')
  }

  // Delete quest from the database
  const result = await deleteQuestFromDb(questId)
  if (!result) {
    throw new Error('Failed to delete quest from database. Please try again.')
  }

  return { success: true }
}
