import type { Quest } from '#/types/quest'
import {
  getQuestByIdFromDb,
  removePartyLeaderFromQuestInDb,
  removePartyFromQuestInDb,
} from './db'
import { getSession } from './getSessionController'

export async function unclaimQuest(
  questId: string,
  activeCharacterId: string,
): Promise<Quest> {

  // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== activeCharacterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

  // Check if quest is already claimed
  const isQuestClaimed = await getQuestByIdFromDb(questId)
  if (!isQuestClaimed?.party_leader?.id) {
    throw new Error('This quest is not currently claimed by any adventurer.')
  }

  // Check if the active character is the party leader of the quest
  const unclaimed = await removePartyLeaderFromQuestInDb(
    questId,
    activeCharacterId,
  )
  if (!unclaimed) {
    throw new Error('Failed to unclaim quest. Please try again.')
  }

  // Remove all party members from the quest
  const removeParty = await removePartyFromQuestInDb(questId)
  if (!removeParty) {
    throw new Error('Failed to remove party members from quest. Please try again.')
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
