import { getQuestByIdFromDb, getRoleById, markQuestAsCompletedInDb } from './db'
import type { Quest } from '#/types/quest'
import { getSession } from './getSessionController'

export async function completeQuest(
  questId: string,
  activeCharacterId: string,
  completedMessage: string,
): Promise<Quest> {

    // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== activeCharacterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

 // Check if quest is already completed
  const isCompleted = await getQuestByIdFromDb(questId)
  if (isCompleted?.is_completed) {
    throw new Error('This quest has already been completed.')
  }

  // Check if character has god role
  const role = await getRoleById(activeCharacterId)
  if (!role || role.toLowerCase() !== 'god') {
    throw new Error('Only characters with the God role can complete quests.') 
  }

  // Mark quest as completed in the database
  const completedDateTime = new Date().toISOString()
  const completedQuest = await markQuestAsCompletedInDb(
    questId,
    activeCharacterId,
    completedMessage,
    completedDateTime,
  )
  if (!completedQuest) {
    throw new Error('Failed to complete quest. Please try again.')
  }

  // Retrieve the updated quest from the database
  const updatedQuest = await getQuestByIdFromDb(questId)
  if (!updatedQuest) {
    throw new Error('Failed to retrieve updated quest. Please try again.')
  }

  return {
    id: updatedQuest.id,
    title: updatedQuest.title,
    description: updatedQuest.description,
    dateTime: updatedQuest.date_time,
    location: updatedQuest.location,
    partySize: updatedQuest.party_size,
    currentParty: updatedQuest.current_party ?? [],
    isCompleted: updatedQuest.is_completed,
    completionMessage: updatedQuest.completion_message,
    createdBy: updatedQuest.created_by,
    rotation: updatedQuest.rotation ?? 0,
    createdByName: updatedQuest.created_by_name ?? 'Unknown Adventurer',
    partyLeader: updatedQuest.party_leader,
  }
}
