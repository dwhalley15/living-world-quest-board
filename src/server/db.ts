import { neon } from '@neondatabase/serverless'
import type { Character, CharacterWithPassword } from '../types/character'

let client: ReturnType<typeof neon>

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    return undefined
  }
  if (!client) {
    client = await neon(process.env.DATABASE_URL!)
  }
  return client
}

export async function checkNameAvailable(name: string): Promise<boolean> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    'SELECT COUNT(*) AS count FROM characters WHERE name = $1',
    [name],
  )
  let count: string | number | undefined
  if (Array.isArray(result) && result.length > 0 && 'count' in result[0]) {
    count = result[0].count
  } else if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray((result as any).rows) &&
    (result as any).rows.length > 0
  ) {
    count = (result as any).rows[0].count
  }
  return String(count) === '0'
}

export async function insertCharacter(character: {
  name: string
  class: string
  level: number
  imageUrl?: string
  passwordHash: string
}) {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    'INSERT INTO characters (name, class, level, image_url, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [
      character.name,
      character.class,
      character.level,
      character.imageUrl || null,
      character.passwordHash,
    ],
  )
  if (Array.isArray(result) && result.length > 0) {
    return result[0]
  } else if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray((result as any).rows) &&
    (result as any).rows.length > 0
  ) {
    return (result as any).rows[0]
  }
}

export async function insertSession(data: {
  characterId: string
  sessionToken: string
  expiresAt: Date
}) {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    'INSERT INTO character_sessions (character_id, session_token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [data.characterId, data.sessionToken, data.expiresAt],
  )
  if (Array.isArray(result) && result.length > 0) {
    return result[0]
  } else if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray((result as any).rows) &&
    (result as any).rows.length > 0
  ) {
    return (result as any).rows[0]
  }
}

export async function getSessionByToken(token: string): Promise<string | null> {
  const db = await getDb()
  if (!db) throw new Error('Database connection not available')

  const result = await db.query(
    `
    SELECT character_id
    FROM character_sessions
    WHERE session_token = $1
      AND expires_at > NOW()
    `,
    [token],
  )
  let row: any = null
  if (Array.isArray(result) && result.length > 0) {
    row = result[0]
  } else if (
    result &&
    'rows' in result &&
    Array.isArray(result.rows) &&
    result.rows.length > 0
  ) {
    row = result.rows[0]
  }
  return row ? row.character_id : null
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    `
    SELECT id, name, class, level, image_url, role
    FROM characters
    WHERE id = $1
    `,
    [id],
  )
  let row: any = null
  if (Array.isArray(result) && result.length > 0) {
    row = result[0]
  } else if (
    result &&
    'rows' in result &&
    Array.isArray(result.rows) &&
    result.rows.length > 0
  ) {
    row = result.rows[0]
  }
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    level: row.level,
    role: row.role,
    imageUrl: row.image_url ?? undefined,
  }
}

export async function getCharacterByIdWithPassword(
  id: string,
): Promise<CharacterWithPassword | null> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    `
    SELECT id, name, class, level, image_url, password_hash, role
    FROM characters
    WHERE id = $1
    `,
    [id],
  )
  let row: any = null
  if (Array.isArray(result) && result.length > 0) {
    row = result[0]
  } else if (
    result &&
    'rows' in result &&
    Array.isArray(result.rows) &&
    result.rows.length > 0
  ) {
    row = result.rows[0]
  }
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    level: row.level,
    role: row.role,
    imageUrl: row.image_url ?? undefined,
    passwordHash: row.password_hash,
  }
}

export async function deleteSessionByToken(token: string) {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  await db.query('DELETE FROM character_sessions WHERE session_token = $1', [
    token,
  ])
}

export async function getCharacterByName(
  name: string,
): Promise<CharacterWithPassword | null> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    `
    SELECT id, name, class, level, image_url, password_hash, role
    FROM characters
    WHERE name = $1
    `,
    [name],
  )
  let row: any = null
  if (Array.isArray(result) && result.length > 0) {
    row = result[0]
  } else if (
    result &&
    'rows' in result &&
    Array.isArray(result.rows) &&
    result.rows.length > 0
  ) {
    row = result.rows[0]
  }
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    level: row.level,
    role: row.role,
    imageUrl: row.image_url ?? undefined,
    passwordHash: row.password_hash,
  }
}

export async function saveCharacter(
  character: CharacterWithPassword,
): Promise<Character> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    `
    UPDATE characters
    SET name = $1, class = $2, level = $3, image_url = $4, password_hash = $5
    WHERE id = $6
    RETURNING id, name, class, level, image_url, role
    `,
    [
      character.name,
      character.class,
      character.level,
      character.imageUrl,
      character.passwordHash,
      character.id,
    ],
  )
  let row: any = null
  if (Array.isArray(result) && result.length > 0) {
    row = result[0]
  } else if (
    result &&
    'rows' in result &&
    Array.isArray(result.rows) &&
    result.rows.length > 0
  ) {
    row = result.rows[0]
  }
  if (!row) throw new Error('Failed to update character')
  return {
    id: row.id,
    name: row.name,
    class: row.class,
    level: row.level,
    role: row.role,
    imageUrl: row.image_url ?? undefined,
  }
}

export async function deleteCharacterFromDb(id: string): Promise<boolean> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  await db.query('DELETE FROM characters WHERE id = $1', [id])
  return true
}

export async function getQuestsFromDb() {
  const db = await getDb()

  if (!db) {
    throw new Error('Database connection not available')
  }

  const result = await db.query(`
    SELECT
      q.*,
      COALESCE(
        json_agg(c.name) FILTER (WHERE c.name IS NOT NULL),
        '[]'
      ) AS current_party
    FROM quests q
    LEFT JOIN quest_party qp ON qp.quest_id = q.id
    LEFT JOIN characters c ON c.id = qp.character_id
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `)

  if (Array.isArray(result)) return result
  if (result && 'rows' in result) return result.rows

  return []
}
