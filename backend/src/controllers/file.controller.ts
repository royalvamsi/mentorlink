import { Request, Response, NextFunction } from 'express'
import {
  saveFile,
  listFiles,
  getFileRecord,
  verifyFileAccess,
  incrementDownload,
  deleteFile,
  FileError,
} from '../services/file.service'
import { UPLOAD_DIR } from '../config/upload'
import path from 'path'
import type { FileCategory } from '../models/SharedFile'

function handleErr(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof FileError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message })
    return
  }
  next(err)
}

export async function uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file uploaded' })
      return
    }
    const { category = 'OTHER', description, mentorshipId, conversationId } = req.body as {
      category?: string
      description?: string
      mentorshipId?: string
      conversationId?: string
    }
    const data = await saveFile(
      req.user!.userId,
      req.file,
      category as FileCategory,
      description,
      mentorshipId,
      conversationId
    )
    res.status(201).json({ status: 'success', data })
  } catch (err) {
    handleErr(err, res, next)
  }
}

export async function getFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mentorshipId } = req.query as { mentorshipId?: string }
    const data = await listFiles(req.user!.userId, mentorshipId)
    res.status(200).json({ status: 'success', data })
  } catch (err) {
    handleErr(err, res, next)
  }
}

export async function downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = await getFileRecord(req.params['id'] as string)
    const userId = req.user!.userId

    const hasAccess = await verifyFileAccess(file, userId)
    if (!hasAccess) {
      res.status(403).json({ status: 'error', message: 'Forbidden' })
      return
    }

    await incrementDownload(String(file._id))
    const filePath = path.join(UPLOAD_DIR, file.storedName)
    res.download(filePath, file.originalName)
  } catch (err) {
    handleErr(err, res, next)
  }
}

export async function removeFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteFile(req.params['id'] as string, req.user!.userId)
    res.status(200).json({ status: 'success', message: 'File deleted' })
  } catch (err) {
    handleErr(err, res, next)
  }
}
