import { insertSession } from "./db"
import { randomBytes } from 'node:crypto'

export async function createSession(characterId: string) {
  const sessionToken = randomBytes(32).toString("hex")

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await insertSession({
    characterId,
    sessionToken,
    expiresAt,
  })

  return {
    sessionToken,
    expiresAt,
  }
}