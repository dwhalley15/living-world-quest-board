import { useState, useEffect } from 'react'
import { CHARACTER_CLASSES, type Character } from '../../types/character'
import { Upload } from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createCharacter } from '../../server/createCharacterController'
import { createSession } from '#/server/createSessionController'
import { setCookie } from '@tanstack/react-start/server'
import { getCharacterById } from '../../server/db'

interface CreateCharacterFormProps {
  onSuccess?: (character: Character) => void
}

const createCharacterFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1, 'Name is required'),
      charClass: z.enum(CHARACTER_CLASSES),
      level: z
        .number()
        .int()
        .min(1, 'Level must be at least 1')
        .max(20, 'Level cannot exceed 20'),
      password: z.string().min(10, 'Password must be at least 10 characters'),
      imageUrl: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const character = await createCharacter(data)
      return { success: true, id: character.id }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

const autoLoginFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ characterId: z.string() }))
  .handler(async ({ data }) => {
    const characterId = data.characterId
    const session = await createSession(characterId)
    setCookie('session', session.sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    })
    const character = await getCharacterById(characterId)
    return { success: true, character }
  })

// This component is responsible for rendering the character creation form, handling user input, uploading the character portrait, and communicating with the server to create the character and log them in.
export default function CreateCharacterForm({
  onSuccess
}: CreateCharacterFormProps) {
  const [name, setName] = useState('')
  const [charClass, setCharClass] = useState<
    (typeof CHARACTER_CLASSES)[number]
  >(CHARACTER_CLASSES[0])
  const [level, setLevel] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCharacter = useServerFn(createCharacterFn)
  const autoLogin = useServerFn(autoLoginFn)
  const MAX_FILE_SIZE = 2 * 1024 * 1024

  // Clean up preview URL when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Handle form submission
  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let imageUrl: string | undefined = undefined
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const response = await fetch('/api/imageUploader', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          const errData = await response.json()
          setError(errData.error || 'Image upload failed')
          setLoading(false)
          return
        }
        const data = await response.json()
        imageUrl = data.url
      }
      const result = await createCharacter({
        data: {
          name,
          charClass,
          level,
          password,
          imageUrl: imageUrl || undefined,
        },
      })
      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      } else {
        const newCharacterId = result.id
        const loginResult = await autoLogin({
          data: { characterId: newCharacterId },
        })
        if (loginResult.character) {
          onSuccess?.(loginResult.character)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-parchment-foreground/5 border border-parchment-foreground/20 rounded text-parchment-foreground font-body placeholder:text-parchment-foreground/30 focus:outline-none focus:border-parchment-foreground/40'

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Character Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Enter your hero's name..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
            Class
          </label>
          <select
            value={charClass}
            onChange={(e) =>
              setCharClass(e.target.value as (typeof CHARACTER_CLASSES)[number])
            }
            className={inputClass}
          >
            {CHARACTER_CLASSES.map((c) => (
              <option key={c} value={c} className="bg-card text-foreground">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
            Level
          </label>
          <input
            type="number"
            min={1}
            max={20}
            required
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Character Portrait
        </label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="w-16 h-16 rounded border border-parchment-foreground/30 overflow-hidden bg-parchment-foreground/5 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Character preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-parchment-foreground/40">
                No Image
              </span>
            )}
          </div>
          {/* Upload button */}
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-parchment-foreground/10 hover:bg-parchment-foreground/20 border border-parchment-foreground/30 rounded text-sm font-display text-parchment-foreground">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={loading}
              onChange={(e) => {
                if (loading) return
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > MAX_FILE_SIZE) {
                  setError('File size exceeds 2MB limit')
                  return
                }
                setError('')
                setImageFile(file)
                const url = URL.createObjectURL(file)
                setPreviewUrl(url)
              }}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-display text-parchment-foreground/80 mb-1">
          Password
        </label>
        <input
          type="password"
          minLength={10}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Secure your character..."
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
        {loading ? 'Creating...' : 'Create Character'}
      </button>
    </form>
  )
}
