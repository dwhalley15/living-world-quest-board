import type { Character } from '../types/character'
import { getCharactersFromDb } from './db'

export async function getCharacters(): Promise<Character[]> {
    
  const rows = await getCharactersFromDb()

  if (!rows || rows.length === 0) return []

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    class: row.class,
    level: row.level,
    role: row.role,
    imageUrl: row.image_url ?? undefined,
  }))
}
