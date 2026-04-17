import { useState, useEffect } from 'react'
import { CHARACTER_CLASSES, type Character } from '../../types/character'
import { Upload } from 'lucide-react'
import { useServerFn, createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { updateCharacter } from '../../server/updateCharacterController'
import Modal from '../Modal'
import { deleteCharacter } from '../../server/deleteCharacterController'

interface EditCharacterFormProps {
  character: Character
  onSuccess?: (character: Character | null) => void
}

const deleteCharacterFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      await deleteCharacter(data.id)
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

const updateCharacterFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Name is required'),
      charClass: z.enum(CHARACTER_CLASSES),
      level: z
        .number()
        .int()
        .min(1, 'Level must be at least 1')
        .max(20, 'Level cannot exceed 20'),
      password: z.string().min(10).optional(),
      imageUrl: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const updatedCharacter = await updateCharacter(data)
      return { success: true, character: updatedCharacter }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  })

export default function EditCharacterForm({
  character,
  onSuccess,
}: EditCharacterFormProps) {
  const [name, setName] = useState(character.name)
  const [charClass, setCharClass] = useState<
    (typeof CHARACTER_CLASSES)[number]
  >(character.class as (typeof CHARACTER_CLASSES)[number])
  const [level, setLevel] = useState(character.level)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    character.imageUrl || null,
  )
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const updateCharacterFnClient = useServerFn(updateCharacterFn)
  const deleteCharacterFnClient = useServerFn(deleteCharacterFn)
  const MAX_FILE_SIZE = 2 * 1024 * 1024

  // Clean up preview URL when component unmounts or when a new file is selected
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:'))
        URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    setName(character.name)
    setCharClass(character.class as (typeof CHARACTER_CLASSES)[number])
    setLevel(character.level)
    setPreviewUrl(character.imageUrl ?? null)
  }, [character])

  async function handleDelete() {
    try {
      setLoading(true)
      setError(null)
      const result = await deleteCharacterFnClient({
        data: { id: character.id },
      })
      if (!result.success) {
        setError(result.message)
      } else {
        onSuccess?.(null)
      }
    } catch (err) {
      setError('Failed to delete character. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      let imageUrl: string | undefined = previewUrl ?? undefined
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

      const result = await updateCharacterFnClient({
        data: {
          id: character.id,
          name,
          charClass,
          level,
          password: password || undefined,
          imageUrl,
        },
      })

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      onSuccess?.(result.character)
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
    <>
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
                setCharClass(
                  e.target.value as (typeof CHARACTER_CLASSES)[number],
                )
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
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Enter a new password..."
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
          {loading ? 'Updating...' : 'Update Character'}
        </button>
      </form>
      <hr className="border-parchment-foreground/20 my-4" />

      <div className="space-y-2">
        <p className="text-sm text-red-500 font-display">Danger Zone</p>

        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="px-3 py-2 border border-red-500/40 text-red-500 rounded text-sm hover:bg-red-500/10"
        >
          Delete Character
        </button>

        <Modal
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-parchment-foreground/80">
              Are you sure you want to delete {character.name}? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={async () => {
                  await handleDelete()
                  setDeleteConfirmOpen(false)
                }}
                className="px-3 py-1.5 border border-red-500/40 rounded text-sm text-red-500 hover:bg-red-500/10"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>

              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3 py-1.5 border border-red-500/40 rounded text-sm text-red-500 hover:bg-red-500/10"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
