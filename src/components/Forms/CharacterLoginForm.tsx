import { useState } from 'react'
import { type Character } from '../../types/character'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createSession } from '#/server/createSessionController'
import { setCookie } from '@tanstack/react-start/server'
import { loginCharacter } from '../../server/characterLoginController'


export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      password: z.string().min(10),
    })
  ).handler(async ({ data }) => {
    const result = await loginCharacter(data.name, data.password)
    if (!result.success) return result
    const session = await createSession(result.character!.id)
    setCookie('session', session.sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    })
    return { success: true, character: result.character }
  })

interface CharacterLoginFormProps {
  onSuccess?: (character: Character) => void
}

export default function CharacterLoginForm({ onSuccess }: CharacterLoginFormProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const loginCharacter = useServerFn(loginFn)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
        const result = await loginCharacter({ data: { name, password } })
        if (!result.success) {
          setError(result.message || 'Login failed')
        } else if (result.character) {
          onSuccess?.(result.character)
        }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40'

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Character Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          className={inputClass}
          placeholder="Enter your hero's name..."
        />
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          className={inputClass}
          placeholder="Enter your password..."
        />
      </div>

      {error && <p className="text-red-500 text-sm font-body">{error}</p>}

      <button
        type="submit"
        className={`w-full py-2.5 border rounded text-parchment-foreground font-display text-sm transition-colors
                ${
                  loading
                    ? 'bg-parchment-foreground/10 border-parchment-foreground/20 text-parchment-foreground/50 cursor-not-allowed'
                    : 'bg-parchment-foreground/15 hover:bg-parchment-foreground/25 border-parchment-foreground/30'
                }
            `}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
