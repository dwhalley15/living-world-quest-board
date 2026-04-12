import { neon } from '@neondatabase/serverless'
import type { Character, CharacterWithPassword } from '../types/character'

let client: ReturnType<typeof neon>

// Database helper functions
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
  creator.name AS created_by_name,

  json_build_object(
    'id', leader.id,
    'name', leader.name,
    'class', leader.class,
    'level', leader.level,
    'role', leader.role,
    'imageUrl', leader.image_url
  ) AS party_leader,

  COALESCE(
    json_agg(
      json_build_object(
        'id', party_member.id,
        'name', party_member.name,
        'class', party_member.class,
        'level', party_member.level,
        'role', party_member.role,
        'imageUrl', party_member.image_url
      )
    ) FILTER (WHERE party_member.id IS NOT NULL),
    '[]'
  ) AS current_party

FROM quests q

LEFT JOIN characters creator ON creator.id = q.created_by
LEFT JOIN characters leader ON leader.id = q.party_leader

LEFT JOIN quest_party qp ON qp.quest_id = q.id
LEFT JOIN characters party_member ON party_member.id = qp.character_id

GROUP BY q.id, creator.name, leader.id
ORDER BY q.created_at DESC
  `)

  if (Array.isArray(result)) return result
  if (result && 'rows' in result) return result.rows

  return []
}

export async function deleteSessionsByCharacterId(characterId: string) {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  await db.query('DELETE FROM character_sessions WHERE character_id = $1', [
    characterId,
  ])
}

export async function getRoleById(characterId: string): Promise<string | null> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query('SELECT role FROM characters WHERE id = $1', [
    characterId,
  ])
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
  return row ? row.role : null
}

export async function insertQuestToDb(data: {
  title: string
  description: string
  dateTime: string
  partySize: number
  location: string
  creatorId: string
  rotation: number
}) {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query(
    `
    INSERT INTO quests (title, description, date_time, party_size, location, created_by, rotation)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, title, description, date_time, party_size, location, created_by, created_at, is_completed, completion_message, rotation
    `,
    [
      data.title,
      data.description,
      data.dateTime,
      data.partySize,
      data.location,
      data.creatorId,
      data.rotation,
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
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dateTime: row.date_time,
    partySize: row.party_size,
    location: row.location,
    createdBy: row.created_by,
    createdAt: row.created_at,
    isCompleted: row.is_completed,
    completionMessage: row.completion_message,
    rotation: row.rotation,
    currentParty: [],
    partyLeader: null,
  }
}

export async function getCharacterNameById(id: string): Promise<string | null> {
  const db = await getDb()
  if (!db) {
    throw new Error('Database connection not available')
  }
  const result = await db.query('SELECT name FROM characters WHERE id = $1', [
    id,
  ])
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
  return row ? row.name : null
}

export async function addPartyLeaderToQuestInDb(
  questId: string,
  characterId: string,
) {
  const db = await getDb()
  if (!db) throw new Error('Database connection not available')

  await db.query('UPDATE quests SET party_leader = $1 WHERE id = $2', [
    characterId,
    questId,
  ])

  return true
}

export async function removePartyLeaderFromQuestInDb(
  questId: string,
  characterId: string,
) {
  const db = await getDb()
  if (!db) throw new Error('Database connection not available')
  await db.query(
    'UPDATE quests SET party_leader = NULL WHERE id = $1 AND party_leader = $2',
    [questId, characterId],
  )

  return true
}

export async function getQuestByIdFromDb(questId: string) {
  const db = await getDb()
  if (!db) throw new Error('Database connection not available')

  const result = await db.query(
    `
    SELECT
  q.*,
  creator.name AS created_by_name,

  COALESCE(
    json_agg(party_member.name)
    FILTER (WHERE party_member.name IS NOT NULL),
    '[]'
  ) AS current_party,

  json_build_object(
    'id', leader.id,
    'name', leader.name,
    'class', leader.class,
    'level', leader.level,
    'role', leader.role,
    'imageUrl', leader.image_url
  ) AS party_leader

FROM quests q

LEFT JOIN characters creator ON creator.id = q.created_by
LEFT JOIN characters leader ON leader.id = q.party_leader
LEFT JOIN quest_party qp ON qp.quest_id = q.id
LEFT JOIN characters party_member ON party_member.id = qp.character_id

WHERE q.id = $1

GROUP BY q.id, creator.name, leader.id
    `,
    [questId],
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
  return row
}
