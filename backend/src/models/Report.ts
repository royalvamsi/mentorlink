import { Schema, model, Document, Types } from 'mongoose'

export type ReportTargetType = 'USER' | 'POST' | 'COMMENT' | 'MESSAGE'
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'MISINFORMATION' | 'OTHER'

export interface IReport extends Document {
  reporterId: Types.ObjectId
  targetType: ReportTargetType
  targetId: Types.ObjectId
  reason: ReportReason
  description?: string
  status: ReportStatus
  resolvedBy?: Types.ObjectId
  resolutionNote?: string
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>(
  {
    reporterId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType:     { type: String, enum: ['USER', 'POST', 'COMMENT', 'MESSAGE'], required: true, index: true },
    targetId:       { type: Schema.Types.ObjectId, required: true, index: true },
    reason:         { type: String, enum: ['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'MISINFORMATION', 'OTHER'], required: true },
    description:    { type: String, trim: true, maxlength: 1000 },
    status:         { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'], default: 'PENDING', index: true },
    resolvedBy:     { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String, trim: true, maxlength: 500 },
    resolvedAt:     { type: Date },
  },
  { timestamps: true }
)

// Prevent duplicate reports from the same reporter on the same target
reportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 }, { unique: true })

const Report = model<IReport>('Report', reportSchema)
export default Report
