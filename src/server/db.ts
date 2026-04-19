import { neon } from '@neondatabase/serverless'
import type { Character, CharacterWithPassword } from '../types/character'
import type { Quest } from '#/types/quest'

let client: ReturnType<typeof neon>

type QuestRow = Record<string, any>

type AddPartyResult = 'added' | 'already_exists'

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  if (!client) {
    client = neon(process.env.DATABASE_URL)
  }

  return client
}

async function requireDb() {
  const db = await getDb()
  if (!db) {
    throw new Error('Database unavailable')
  }
  return db
}

function getDbRows(result: any): QuestRow[] {
  if (!result) return []
  if (Array.isArray(result?.rows)) return result.rows
  if (Array.isArray(result)) return result
  return []
}

export async function checkNameAvailable(name: string): Promise<boolean> {
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()

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
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()
  await db.query('DELETE FROM character_sessions WHERE session_token = $1', [
    token,
  ])
}

export async function getCharacterByName(
  name: string,
): Promise<CharacterWithPassword | null> {
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()
  await db.query('DELETE FROM character_sessions WHERE character_id = $1', [
    characterId,
  ])
}

export async function getRoleById(characterId: string): Promise<string | null> {
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()
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
  const db = await requireDb()

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
  const db = await requireDb()
  await db.query(
    'UPDATE quests SET party_leader = NULL WHERE id = $1 AND party_leader = $2',
    [questId, characterId],
  )

  return true
}

export async function removePartyFromQuestInDb(questId: string) {
  const db = await requireDb()
  await db.query('DELETE FROM quest_party WHERE quest_id = $1', [questId])
  return true
}

export async function getQuestByIdFromDb(questId: string) {
  const db = await requireDb()

  const result = await db.query(
    `
    SELECT
      q.*,
      creator.name AS created_by_name,

      leader.id AS leader_id,
      leader.name AS leader_name,
      leader.class AS leader_class,
      leader.level AS leader_level,
      leader.role AS leader_role,
      leader.image_url AS leader_image_url,

      party_member.id AS party_member_id,
      party_member.name AS party_member_name

    FROM quests q
    LEFT JOIN characters creator ON creator.id = q.created_by
    LEFT JOIN characters leader ON leader.id = q.party_leader
    LEFT JOIN quest_party qp ON qp.quest_id = q.id
    LEFT JOIN characters party_member ON party_member.id = qp.character_id

    WHERE q.id = $1
    `,
    [questId],
  )

  const rows = getDbRows(result)
  if (rows.length === 0) return null

  const base = rows[0]

  // -------------------------
  // PARTY LEADER -> Character | null
  // -------------------------
  const partyLeader: Character | null = base.leader_id
    ? {
        id: base.leader_id,
        name: base.leader_name,
        class: base.leader_class,
        level: base.leader_level,
        role: base.leader_role,
        imageUrl: base.leader_image_url,
      }
    : null

  // -------------------------
  // PARTY MEMBERS -> Character[]
  // -------------------------
  const memberMap = new Map<string, Character>()

  for (const r of rows) {
    if (!r.party_member_id) continue

    memberMap.set(r.party_member_id, {
      id: r.party_member_id,
      name: r.party_member_name,
      class: r.party_member_class,
      level: r.party_member_level,
      role: r.party_member_role,
      imageUrl: r.party_member_image_url,
    })
  }

  const currentParty: Character[] = Array.from(memberMap.values())

  // -------------------------
  // RETURN NORMALISED QUEST
  // -------------------------
  return {
    id: base.id,
    title: base.title,
    description: base.description,
    date_time: base.date_time,
    location: base.location,
    party_size: base.party_size,
    is_completed: base.is_completed,
    completion_message: base.completion_message,
    created_by: base.created_by,
    created_by_name: base.created_by_name ?? 'Unknown',
    rotation: base.rotation ?? 0,

    current_party: currentParty,
    party_leader: partyLeader,
  }
}

export async function markQuestAsCompletedInDb(
  questId: string,
  characterId: string,
  completedMessage: string,
  completedDateTime: string,
) {
  const db = await requireDb()

  const result = await db.query(
    `
    UPDATE quests
    SET is_completed = TRUE, completion_message = $1, date_time = $2
    WHERE id = $3 AND party_leader = $4
    RETURNING *
    `,
    [completedMessage, completedDateTime, questId, characterId],
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

export async function updateQuestInDb(data: {
  id: string
  title: string
  description: string
  partySize: number
  location: string
}) {
  const db = await requireDb()

  const result = await db.query(
    `
    UPDATE quests
    SET title = $1, description = $2, party_size = $3, location = $4
    WHERE id = $5
    RETURNING *
    `,
    [data.title, data.description, data.partySize, data.location, data.id],
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

export async function deleteQuestFromDb(questId: string) {
  const db = await requireDb()
  await db.query('DELETE FROM quests WHERE id = $1', [questId])
  return true
}

export async function getCharactersFromDb() {
  const db = await requireDb()
  const result = await db.query(
    `
    SELECT id, name, class, level, role, image_url
    FROM characters
    ORDER BY name ASC
    `,
  )
  if (Array.isArray(result)) return result
  if (result && 'rows' in result) return result.rows
  return []
}

export async function addCharacterToQuestPartyInDb(
  questId: string,
  characterId: string,
): Promise<AddPartyResult> {
  const db = await requireDb()

  const result = await db.query(
    `INSERT INTO quest_party (quest_id, character_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING character_id`,
    [questId, characterId],
  )

  // Normalize result into array form
  const rows = Array.isArray(result)
    ? result
    : result && typeof result === 'object' && 'rows' in result
      ? result.rows
      : []

  return rows.length > 0 ? 'added' : 'already_exists'
}

export async function removeCharacterFromQuestPartyInDb(
  questId: string,
  characterId: string,
): Promise<boolean> {
  const db = await requireDb()
  await db.query(
    `DELETE FROM quest_party WHERE quest_id = $1 AND character_id = $2`,
    [questId, characterId],
  )
  return true
}


export async function getQuestsByCharacterId(characterId: string): Promise<Quest[]> {
  const db = await requireDb()
  const result = await db.query(
    `
    SELECT * FROM quests WHERE party_leader = $1
    `,
    [characterId],
  )

  if (result && typeof result === 'object' && 'rows' in result && Array.isArray(result.rows)) {
    return result.rows as Quest[]
  }

  if (Array.isArray(result)) {
    if (result.length > 0 && Array.isArray(result[0])) {
      return []
    }
    return result as Quest[]
  }
  return []
}