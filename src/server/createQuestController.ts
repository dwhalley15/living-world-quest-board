import type { Quest } from '#/types/quest'
import { getRoleById, insertQuestToDb, getCharacterNameById  } from './db'
import { getSession } from './getSessionController'

export async function createQuest(data: {
  title: string
  description: string
  dateTime: string
  partySize: number
  location: string
  rotation: number
  creatorId: string
}): Promise<Quest> {

  // Validate session and character
  const sessionCharacterId = await getSession()
  if (!sessionCharacterId) {
    throw new Error('Unauthorized: No active session found. Please log in to create a quest.')
  }
  if (sessionCharacterId !== data.creatorId) {
    throw new Error('Unauthorized: Session character ID does not match creator ID. Please log in with the correct character to create a quest.')
  }

  // Check if character has god role
  const characterRole = await getRoleById(data.creatorId)
  if (!characterRole) {
    throw new Error('Unauthorized: Character role not found. Please ensure your character has a valid role to create quests.')
  }
  if (characterRole !== 'god') {
    throw new Error('Unauthorized: Only characters with the God role can create quests. Please log in with a character that has the God role to create quests.')
  }

  // Insert quest into the database
  const quest = await insertQuestToDb(data)
  if (!quest) {
    throw new Error('Failed to create quest. Please try again.')
  }

  // Retrieve the character name of the quest creator
  const characterName = await getCharacterNameById(data.creatorId)
  if (!characterName) {
    throw new Error('Failed to retrieve character name. Please try again.')
  }

    return { ...quest, createdByName: characterName }
}
