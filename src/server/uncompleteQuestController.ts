import { getQuestByIdFromDb, getRoleById, markQuestAsIncompleteInDb } from './db'
import type { Quest } from '#/types/quest'
import { getSession } from './getSessionController'

export async function uncompleteQuest(
  questId: string,
  activeCharacterId: string,
): Promise<Quest> {
  // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== activeCharacterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

  // Check if quest is completed
  const isCompleted = await getQuestByIdFromDb(questId)
  if (isCompleted?.is_completed === false) {
    throw new Error('This quest has not already been completed.')
  }

  // Check if character has god role
  const role = await getRoleById(activeCharacterId)
  if (!role || role.toLowerCase() !== 'god') {
    throw new Error('Only characters with the God role can complete quests.')
  }

  //Set quest as no longer completed delete completed message
  const uncompletedQuest = await markQuestAsIncompleteInDb(questId)
  if (!uncompletedQuest) {
    throw new Error('Failed to uncomplete quest. Please try again.')
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
    partyLeader: updatedQuest.party_leader,

    isCompleted: updatedQuest.is_completed,
    completionMessage: updatedQuest.completion_message ?? undefined,

    createdBy: updatedQuest.created_by,
    createdByName: updatedQuest.created_by_name ?? 'Unknown Adventurer',
    rotation: updatedQuest.rotation ?? 0,
  }
}
