import { getCookie } from '@tanstack/react-start/server'
import { getSessionByToken } from './db'

export async function getSession() {
  const token = getCookie('session')

  if (!token) return null

  const characterId = await getSessionByToken(token)

  if (!characterId) return null

  return characterId
}