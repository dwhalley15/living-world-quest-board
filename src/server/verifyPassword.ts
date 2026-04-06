import bcrypt from 'bcryptjs'

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, passwordHash)
    } catch (error) {
        console.error('Error verifying password:', error)
        return false
    }
}