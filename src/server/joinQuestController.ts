import { addCharacterToQuestInDb } from './db'

export async function joinQuest(questId: string, characterId: string): Promise<boolean> {

    const joined = await addCharacterToQuestInDb(questId, characterId)

    if (!joined) {
        throw new Error('Failed to join quest')
    }

    return true;
}