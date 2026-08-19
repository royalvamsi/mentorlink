import { Schema, model, Document, Types } from 'mongoose'

export type MentorshipStatus = 'ACTIVE' | 'ENDED'

export interface IMentorship extends Document {
  menteeId: Types.ObjectId
  mentorId: Types.ObjectId
  requestId: Types.ObjectId
  status: MentorshipStatus
  startedAt: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const mentorshipSchema = new Schema<IMentorship>(
  {
    menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'MentorshipRequest', required: true },
    status: { type: String, enum: ['ACTIVE', 'ENDED'], default: 'ACTIVE', index: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
)

mentorshipSchema.index({ menteeId: 1, mentorId: 1 })

const Mentorship = model<IMentorship>('Mentorship', mentorshipSchema)
export default Mentorship
