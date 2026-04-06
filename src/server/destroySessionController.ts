import { deleteSessionByToken } from './db'
import { getCookie, setCookie } from '@tanstack/react-start/server'

export async function destroySession() {
  const token = getCookie('session')
  if (!token) return false

  await deleteSessionByToken(token)

  setCookie('session', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })

  return true
}