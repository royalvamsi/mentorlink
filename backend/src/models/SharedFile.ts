import { Schema, model, Document, Types } from 'mongoose'

export type FileCategory = 'RESOURCE' | 'ASSIGNMENT' | 'NOTES' | 'OTHER'

export interface ISharedFile extends Document {
  uploaderId: Types.ObjectId
  mentorshipId?: Types.ObjectId
  conversationId?: Types.ObjectId
  originalName: string
  storedName: string     // filename on disk / cloud
  mimeType: string
  size: number           // bytes
  category: FileCategory
  description?: string
  downloadCount: number
  createdAt: Date
  updatedAt: Date
}

const sharedFileSchema = new Schema<ISharedFile>(
  {
    uploaderId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorshipId:   { type: Schema.Types.ObjectId, ref: 'Mentorship', index: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', index: true },
    originalName:   { type: String, required: true },
    storedName:     { type: String, required: true },
    mimeType:       { type: String, required: true },
    size:           { type: Number, required: true },
    category:       { type: String, enum: ['RESOURCE', 'ASSIGNMENT', 'NOTES', 'OTHER'], default: 'OTHER' },
    description:    { type: String, trim: true, maxlength: 500 },
    downloadCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

const SharedFile = model<ISharedFile>('SharedFile', sharedFileSchema)
export default SharedFile
