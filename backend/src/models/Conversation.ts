import { Schema, model, Document, Types } from 'mongoose'

export interface IConversation extends Document {
  participants: Types.ObjectId[]
  mentorshipId?: Types.ObjectId
  lastMessage?: string
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    mentorshipId: { type: Schema.Types.ObjectId, ref: 'Mentorship' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true }
)

conversationSchema.index({ participants: 1 })

const Conversation = model<IConversation>('Conversation', conversationSchema)
export default Conversation
