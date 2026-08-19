import { Schema, model, Document, Types } from 'mongoose'

export type GoalStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

export interface IMilestone {
  _id?: Types.ObjectId
  title: string
  completed: boolean
  dueDate?: Date
  completedAt?: Date
}

export interface IGoal extends Document {
  userId: Types.ObjectId
  mentorshipId?: Types.ObjectId
  title: string
  description?: string
  status: GoalStatus
  targetDate?: Date
  completedAt?: Date
  milestones: IMilestone[]
  tags: string[]
  progress: number   // 0-100 %
  createdAt: Date
  updatedAt: Date
}

const milestoneSchema = new Schema<IMilestone>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    completed:   { type: Boolean, default: false },
    dueDate:     { type: Date },
    completedAt: { type: Date },
  },
  { _id: true }
)

const goalSchema = new Schema<IGoal>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorshipId: { type: Schema.Types.ObjectId, ref: 'Mentorship', index: true },
    title:        { type: String, required: true, trim: true, maxlength: 200 },
    description:  { type: String, trim: true, maxlength: 2000 },
    status:       { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'NOT_STARTED', index: true },
    targetDate:   { type: Date },
    completedAt:  { type: Date },
    milestones:   [milestoneSchema],
    tags:         [{ type: String, trim: true, maxlength: 30 }],
    progress:     { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
)

// Auto-compute progress from milestones (virtual won't save — we'll compute on update)
const Goal = model<IGoal>('Goal', goalSchema)
export default Goal
