import { Schema, model, Document, Types } from 'mongoose'

export type NotificationType =
  | 'MENTORSHIP_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_DECLINED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_REMINDER'
  | 'NEW_MESSAGE'
  | 'FEEDBACK_RECEIVED'
  | 'GOAL_COMPLETED'
  | 'FORUM_REPLY'
  | 'SYSTEM'

export interface INotification extends Document {
  userId: Types.ObjectId      // recipient
  type: NotificationType
  title: string
  body: string
  read: boolean
  link?: string               // frontend route to navigate to
  meta?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:    { type: String, required: true },
    title:   { type: String, required: true, trim: true, maxlength: 200 },
    body:    { type: String, required: true, trim: true, maxlength: 500 },
    read:    { type: Boolean, default: false, index: true },
    link:    { type: String },
    meta:    { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

const Notification = model<INotification>('Notification', notificationSchema)
export default Notification
