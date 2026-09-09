import SharedFile from '../models/SharedFile'
import Mentorship from '../models/Mentorship'
import Conversation from '../models/Conversation'
import { Types } from 'mongoose'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR } from '../config/upload'
import type { FileCategory } from '../models/SharedFile'

export class FileError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'FileError'
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
  // If attached to a mentorship, verify uploader is mentor or mentee
  if (mentorshipId) {
    if (!Types.ObjectId.isValid(mentorshipId)) {
      throw new FileError(400, 'Invalid mentorship ID')
    }
    const mentorship = await Mentorship.findById(mentorshipId).lean()
    if (!mentorship) {
      throw new FileError(404, 'Mentorship not found')
    }
    const isMember =
      mentorship.mentorId.toString() === uploaderId ||
      mentorship.menteeId.toString() === uploaderId
    if (!isMember) {
      throw new FileError(403, 'You are not a member of this mentorship')
    }
  }

  // If attached to a conversation, verify uploader is a participant
  if (conversationId) {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new FileError(400, 'Invalid conversation ID')
    }
    const conversation = await Conversation.findById(conversationId).lean()
    if (!conversation) {
      throw new FileError(404, 'Conversation not found')
    }
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === uploaderId
    )
    if (!isParticipant) {
      throw new FileError(403, 'You are not a participant in this conversation')
    }
  }

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
  if (mentorshipId) {
    if (!Types.ObjectId.isValid(mentorshipId)) {
      throw new FileError(400, 'Invalid mentorship ID')
    }
    const mentorship = await Mentorship.findById(mentorshipId).lean()
    if (!mentorship) {
      throw new FileError(404, 'Mentorship not found')
    }
    const isMember =
      mentorship.mentorId.toString() === userId ||
      mentorship.menteeId.toString() === userId
    if (!isMember) {
      throw new FileError(403, 'You are not a member of this mentorship')
    }
    filter['mentorshipId'] = new Types.ObjectId(mentorshipId)
  } else {
    // When no mentorshipId is specified, only list public campus files (exclude private mentorship/chat files)
    filter['mentorshipId'] = { $in: [null, undefined] }
    filter['conversationId'] = { $in: [null, undefined] }
  }

  return SharedFile.find(filter)
    .populate('uploaderId', 'name role')
    .sort({ createdAt: -1 })
    .lean()
}

export async function getFileRecord(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new FileError(400, 'Invalid file ID')
  }
  const file = await SharedFile.findById(id).lean()
  if (!file) throw new FileError(404, 'File not found')
  return file
}

export async function verifyFileAccess(
  file: {
    uploaderId: Types.ObjectId
    mentorshipId?: Types.ObjectId
    conversationId?: Types.ObjectId
  },
  userId: string
): Promise<boolean> {
  // Uploader always has access
  if (file.uploaderId.toString() === userId) return true

  // If attached to a private mentorship, ONLY members (mentor or mentee) have access
  if (file.mentorshipId) {
    const mentorship = await Mentorship.findById(file.mentorshipId).lean()
    if (
      mentorship &&
      (mentorship.mentorId.toString() === userId ||
        mentorship.menteeId.toString() === userId)
    ) {
      return true
    }
    return false
  }

  // If attached to a private conversation, ONLY conversation participants have access
  if (file.conversationId) {
    const conversation = await Conversation.findById(file.conversationId).lean()
    if (
      conversation &&
      conversation.participants.some((p) => p.toString() === userId)
    ) {
      return true
    }
    return false
  }

  // General campus library file (not attached to any private mentorship or conversation)
  return true
}

export async function incrementDownload(id: string) {
  await SharedFile.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })
}

export async function deleteFile(id: string, userId: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new FileError(400, 'Invalid file ID')
  }
  const file = await SharedFile.findById(id)
  if (!file) throw new FileError(404, 'File not found')
  if (file.uploaderId.toString() !== userId) throw new FileError(403, 'Forbidden')
  // Remove disk file
  const filePath = path.join(UPLOAD_DIR, file.storedName)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  await file.deleteOne()
}
