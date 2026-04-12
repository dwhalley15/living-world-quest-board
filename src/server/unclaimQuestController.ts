import type { Quest } from '#/types/quest';
import { getQuestByIdFromDb, removePartyLeaderFromQuestInDb } from './db'

export async function unclaimQuest(questId: string, activeCharacterId: string): Promise<Quest> {

    const unclaimed = await removePartyLeaderFromQuestInDb(questId, activeCharacterId)

    if (!unclaimed) {
        return Promise.reject(new Error('Failed to unclaim quest. Please try again.'))
    }

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
        partyLeader: null
    }
}