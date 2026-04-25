import type { Quest } from '../types/quest'
import { getQuestByIdFromDb, getRoleById, removeCharacterFromQuestPartyInDb } from './db'
import { getSession } from './getSessionController'

export async function removeFromParty(
    questId: string,
    characterId: string,
    activeCharacterId: string | null,
): Promise<Quest> {

    // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId || sessionCharacterId !== activeCharacterId) {
    throw new Error('Unauthorized: No valid session found for the character.')
  }

  // Check if the character is the party leader of the quest
  const quest = await getQuestByIdFromDb(questId)

  const isLeader = quest?.party_leader?.id === sessionCharacterId
  const characterRole = await getRoleById(sessionCharacterId)
  const isGod = characterRole === 'god'

  if (!isLeader && !isGod) {
    throw new Error('You must be the party leader or have the God role to remove members from the party.')
  }

  // Check if quest is completed
  if(quest?.is_completed == true) {
    throw new Error('Cannot remove members from a completed quest.')
  }

  // Remove character from quest party in the database
  const questUpdated = await removeCharacterFromQuestPartyInDb(questId, characterId)
    if (!questUpdated) {
        throw new Error('Failed to remove character from party. Please try again.')
    }

  // Retrieve the updated quest from the database
  const updatedQuest = await getQuestByIdFromDb(questId)
  if (!updatedQuest) {
    throw new Error('Failed to retrieve updated quest. Please try again.')
  }

  return{
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