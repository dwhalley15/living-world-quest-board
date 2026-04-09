import type { Quest } from '#/types/quest'
import { getRoleById, insertQuestToDb,  } from './db'
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

  const sessionCharacterId = await getSession()
  if (!sessionCharacterId) {
    throw new Error('Not authenticated')
  }

  if (sessionCharacterId !== data.creatorId) {
    throw new Error('Unauthorized')
  }

  const characterRole = await getRoleById(data.creatorId)

  if (!characterRole) {
    throw new Error('Character not found')
  }

  if (characterRole !== 'god') {
    throw new Error('You are banned from creating quests')
  }

  const quest = await insertQuestToDb(data)
  if (!quest) {
    throw new Error('Failed to create quest')
  }

    return quest
}
