import { checkNameAvailable, insertCharacter } from './db'
import { hashPassword } from './passwordHasher'

export async function createCharacter(data: {
  name: string
  charClass: string
  level: number
  imageUrl?: string
  password: string
}): Promise<{ id: string }> {
  
  // Check if name is available
  const available = await checkNameAvailable(data.name)
  if (!available) {
    return Promise.reject(new Error('Character name is already taken. Please choose a different name.'))
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Save character to database
  const character = await insertCharacter({
    name: data.name,
    class: data.charClass,
    level: data.level,
    imageUrl: data.imageUrl,
    passwordHash: hashedPassword,
  })

  return { id: character.id }
}
