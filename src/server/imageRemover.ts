import { del } from '@vercel/blob'

export async function deleteImageFromBlobStorage(imageUrl: string) {
  try {
    await del(imageUrl)
    return true
  } catch (err: any) {
    console.error('Error deleting image from blob storage:', err)
    return false
  }
}
