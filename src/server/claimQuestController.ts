import type { Quest } from '#/types/quest';
import { th } from 'zod/v4/locales';
import { addPartyLeaderToQuestInDb, getQuestByIdFromDb } from './db'
import { getSession } from './getSessionController';

export async function claimQuest(questId: string, characterId: string): Promise<Quest> {

    // Validate session and character
    const sessionCharacterId = await getSession()
    if (!sessionCharacterId || sessionCharacterId !== characterId) {
        throw new Error('Unauthorized: No valid session found for the character.')
    }

    // Check if quest is already claimed
    const isQuestClaimed = await getQuestByIdFromDb(questId)
    if (isQuestClaimed?.party_leader?.id) {
        throw new Error('This quest has already been claimed by another adventurer.')
    }

    // Add party leader to quest in the database
    const questUpdated = await addPartyLeaderToQuestInDb(questId, characterId)  
    if (!questUpdated) {
        throw new Error('Failed to claim quest. Please try again.')
    }

    // Retrieve the updated quest from the database
    const updatedQuest = await getQuestByIdFromDb(questId)
    if(!updatedQuest){
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
        completionMessage: updatedQuest.completion_message ?? undefined,
        createdBy: updatedQuest.created_by,
        rotation: updatedQuest.rotation ?? 0,
        createdByName: updatedQuest.created_by_name ?? 'Unknown Adventurer',
        partyLeader: updatedQuest.party_leader
    }
}