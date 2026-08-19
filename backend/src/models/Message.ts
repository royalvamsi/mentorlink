import { Schema, model, Document, Types } from 'mongoose'

export interface IMessage extends Document {
  conversationId: Types.ObjectId
  senderId: Types.ObjectId
  content: string
  readBy: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

messageSchema.index({ conversationId: 1, createdAt: 1 })

const Message = model<IMessage>('Message', messageSchema)
export default Message
