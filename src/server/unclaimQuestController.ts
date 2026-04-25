import type { Quest } from '#/types/quest'
import {
  getQuestByIdFromDb,
  removePartyLeaderFromQuestInDb,
  removePartyFromQuestInDb,
  getRoleById,
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

  // Check if the active character has the God role or is the party leader of the quest
  const characterRole = await getRoleById(activeCharacterId)
  if (!characterRole) {
    throw new Error('Unauthorized: Character role not found.')
  }
  const isGod = characterRole === 'god'
  const isPartyLeader = isQuestClaimed.party_leader?.id === activeCharacterId
  if (!isGod && !isPartyLeader) {
    throw new Error(
      'Unauthorized: Only the party leader or a character with the God role can unclaim this quest.',
    )
  }

  const leaderId = isPartyLeader ? activeCharacterId : isQuestClaimed.party_leader?.id

  // Unclaim the quest by removing the party leader
  const unclaimed = await removePartyLeaderFromQuestInDb(
    questId,
    leaderId,
  )
  if (!unclaimed) {
    throw new Error('Failed to unclaim quest. Please try again.')
  }

  // Remove all party members from the quest
  const removeParty = await removePartyFromQuestInDb(questId)
  if (!removeParty) {
    throw new Error(
      'Failed to remove party members from quest. Please try again.',
    )
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
