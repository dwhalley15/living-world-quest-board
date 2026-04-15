import type { Quest } from '../types/quest'
import { getSession } from './getSessionController'
import { getQuestByIdFromDb, getRoleById, updateQuestInDb } from './db'

interface UpdateQuestData {
  id: string
  title: string
  description: string
  partySize: number
  location: string
  activeCharacterId: string
}

export async function updateQuest(data: UpdateQuestData): Promise<Quest> {

  // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== data.activeCharacterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

  // Check if quest is already completed
  const isCompleted = await getQuestByIdFromDb(data.id)
  if (isCompleted?.is_completed) {
    throw new Error('This quest has already been completed.')
  }

  // Check if character has god role
  const role = await getRoleById(data.activeCharacterId)
  if (!role || role.toLowerCase() !== 'god') {
    throw new Error('Only characters with the God role can complete quests.')
  }

  // Update quest in the database
  const updated = await updateQuestInDb(data)
  if (!updated) {
    throw new Error('Failed to update quest. Please try again.')
  }

  // Retrieve the updated quest from the database
  const updatedQuest = await getQuestByIdFromDb(data.id)
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
