import SharedFile from '../models/SharedFile'
import { Types } from 'mongoose'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '../config/upload'
import type { FileCategory } from '../models/SharedFile'

export class FileError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); this.name = 'FileError'
  }
}

export async function saveFile(
  uploaderId: string,
  file: Express.Multer.File,
  category: FileCategory,
  description?: string,
  mentorshipId?: string,
  conversationId?: string
) {
  return SharedFile.create({
    uploaderId: new Types.ObjectId(uploaderId),
    mentorshipId: mentorshipId ? new Types.ObjectId(mentorshipId) : undefined,
    conversationId: conversationId ? new Types.ObjectId(conversationId) : undefined,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    category,
    description,
  })
}

export async function listFiles(userId: string, mentorshipId?: string) {
  const filter: Record<string, unknown> = {}
  if (mentorshipId) filter['mentorshipId'] = new Types.ObjectId(mentorshipId)
  else filter['uploaderId'] = new Types.ObjectId(userId)
  return SharedFile.find(filter)
    .populate('uploaderId', 'name role')
    .sort({ createdAt: -1 })
    .lean()
}

export async function getFileRecord(id: string) {
  const file = await SharedFile.findById(id).lean()
  if (!file) throw new FileError(404, 'File not found')
  return file
}

export async function incrementDownload(id: string) {
  await SharedFile.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })
}

export async function deleteFile(id: string, userId: string) {
  const file = await SharedFile.findById(id)
  if (!file) throw new FileError(404, 'File not found')
  if (file.uploaderId.toString() !== userId) throw new FileError(403, 'Forbidden')
  // Remove disk file
  const filePath = path.join(UPLOAD_DIR, file.storedName)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  await file.deleteOne()
}
