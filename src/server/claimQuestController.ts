import type { Quest } from '#/types/quest';
import { addPartyLeaderToQuestInDb, getQuestByIdFromDb } from './db'
import { getSession } from './getSessionController';

export async function claimQuest(questId: string, characterId: string): Promise<Quest> {

    // Validate session and character
    const sessionCharacterId = await getSession()
    if (!sessionCharacterId || sessionCharacterId !== characterId) {
        return Promise.reject(new Error('Unauthorized: Character ID does not match active session.'))
    }

    // Check if quest is already claimed
    const isQuestClaimed = await getQuestByIdFromDb(questId)
    if (isQuestClaimed?.party_leader?.id) {
        return Promise.reject(new Error('This quest has already been claimed by another adventurer. Please choose a different quest.'))
    }

    // Add party leader to quest in the database
    const questUpdated = await addPartyLeaderToQuestInDb(questId, characterId)  
    if (!questUpdated) {
        return Promise.reject(new Error('Failed to claim quest. Please try again.'))
    }

    // Retrieve the updated quest from the database
    const updatedQuest = await getQuestByIdFromDb(questId)
    if(!updatedQuest){
        return Promise.reject(new Error('Failed to retrieve updated quest. Please try again.'))
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
        completionMessage: updatedQuest.completion_message ?? undefined,
        createdBy: updatedQuest.created_by,
        rotation: updatedQuest.rotation ?? 0,
        createdByName: updatedQuest.created_by_name ?? 'Unknown Adventurer',
        partyLeader: updatedQuest.party_leader
    }
}