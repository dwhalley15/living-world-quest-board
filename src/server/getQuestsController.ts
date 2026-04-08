import { getQuestsFromDb } from './db'
import type { Quest } from '#/types/quest'

export async function getQuests(): Promise<Quest[]> {
  const rows = await getQuestsFromDb()

  if (!rows || rows.length === 0) return []

  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    dateTime: row.date_time,
    location: row.location,
    partySize: row.party_size,
    currentParty: row.current_party ?? [],
    isCompleted: row.is_completed,
    completionMessage: row.completion_message ?? undefined,
    createdBy: row.created_by,
    rotation: row.rotation ?? 0,
  }))
}
