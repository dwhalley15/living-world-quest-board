import type { Quest } from '../types/quest'
import { addCharacterToQuestPartyInDb, getQuestByIdFromDb,  } from './db'
import { getSession } from './getSessionController'

export async function addToParty(
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
  if (quest?.party_leader?.id !== sessionCharacterId) {
    throw new Error('You must be the party leader to add members to the party.')
  }

  // Check if party is full
  if(quest?.current_party.length >= quest.party_size - 1) {
    throw new Error('Party is already full. Cannot add more members.')
  }

  // Check if quest is completed
  if(quest?.is_completed == true) {
    throw new Error('Cannot join a completed quest.')
  }

  // Add character to quest party in the database
  const questUpdated = await addCharacterToQuestPartyInDb(questId, characterId)
  if (questUpdated === 'already_exists') {
    throw new Error('Failed to add character to party. Please try again.')
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
