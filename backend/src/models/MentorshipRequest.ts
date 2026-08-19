import { Schema, model, Document, Types } from 'mongoose'

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export interface IMentorshipRequest extends Document {
  menteeId: Types.ObjectId
  mentorId: Types.ObjectId
  message?: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
}

const mentorshipRequestSchema = new Schema<IMentorshipRequest>(
  {
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
  },
  { timestamps: true }
)

// Compound index to detect duplicates
mentorshipRequestSchema.index({ menteeId: 1, mentorId: 1, status: 1 })

const MentorshipRequest = model<IMentorshipRequest>('MentorshipRequest', mentorshipRequestSchema)
export default MentorshipRequest
