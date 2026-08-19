import Conversation from '../models/Conversation'
import Message from '../models/Message'
import User from '../models/User'
import { Types } from 'mongoose'

export class ChatServiceError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'ChatServiceError'
  }
}

export async function getOrCreateConversation(userId1: string, userId2: string) {
  if (userId1 === userId2) {
    throw new ChatServiceError(400, 'Cannot start a conversation with yourself')
  }
  if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
    throw new ChatServiceError(400, 'Invalid user ID')
  }

  const targetUser = await User.findById(userId2)
  if (!targetUser) {
    throw new ChatServiceError(404, 'User not found')
  }

  const existing = await Conversation.findOne({
    participants: { $all: [new Types.ObjectId(userId1), new Types.ObjectId(userId2)], $size: 2 }
  }).populate('participants', 'name email role')

  if (existing) return existing

  const conv = await Conversation.create({
    participants: [new Types.ObjectId(userId1), new Types.ObjectId(userId2)]
  })

  return Conversation.findById(conv._id).populate('participants', 'name email role')
}

export async function getMyConversations(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ChatServiceError(400, 'Invalid user ID')
  }
  return Conversation.find({ participants: new Types.ObjectId(userId) })
    .populate('participants', 'name email role')
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean()
}

export async function getMessages(conversationId: string, userId: string, page = 1, limit = 30) {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ChatServiceError(400, 'Invalid conversation ID')
  }
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ChatServiceError(404, 'Conversation not found')
  const isParticipant = conversation.participants.some((p) => p.toString() === userId)
  if (!isParticipant) throw new ChatServiceError(403, 'Access denied')

  const skip = (page - 1) * limit
  const messages = await Message.find({ conversationId: new Types.ObjectId(conversationId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'name role')
    .lean()
  return messages.reverse()
}

export async function saveMessage(conversationId: string, senderId: string, content: string) {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ChatServiceError(400, 'Invalid conversation ID')
  }
  if (!content || !content.trim()) {
    throw new ChatServiceError(400, 'Message content cannot be empty')
  }
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ChatServiceError(404, 'Conversation not found')
  const isParticipant = conversation.participants.some((p) => p.toString() === senderId)
  if (!isParticipant) throw new ChatServiceError(403, 'Access denied')

  const message = await Message.create({
    conversationId: new Types.ObjectId(conversationId),
    senderId: new Types.ObjectId(senderId),
    content: content.trim(),
    readBy: [new Types.ObjectId(senderId)],
  })

  conversation.lastMessage = content.trim()
  conversation.lastMessageAt = new Date()
  await conversation.save()

  return Message.findById(message._id).populate('senderId', 'name role').lean()
}

export async function markRead(conversationId: string, userId: string) {
  if (!Types.ObjectId.isValid(conversationId)) {
    throw new ChatServiceError(400, 'Invalid conversation ID')
  }
  const conversation = await Conversation.findById(conversationId)
  if (!conversation) throw new ChatServiceError(404, 'Conversation not found')
  const isParticipant = conversation.participants.some((p) => p.toString() === userId)
  if (!isParticipant) throw new ChatServiceError(403, 'Access denied')

  await Message.updateMany(
    { conversationId: new Types.ObjectId(conversationId), readBy: { $ne: new Types.ObjectId(userId) } },
    { $addToSet: { readBy: new Types.ObjectId(userId) } }
  )
}

export async function getUnreadCount(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ChatServiceError(400, 'Invalid user ID')
  }
  const conversations = await Conversation.find({ participants: new Types.ObjectId(userId) }).select('_id').lean()
  const counts: Record<string, number> = {}
  for (const conv of conversations) {
    const count = await Message.countDocuments({
      conversationId: conv._id,
      senderId: { $ne: new Types.ObjectId(userId) },
      readBy: { $ne: new Types.ObjectId(userId) },
    })
    if (count > 0) counts[(conv._id as Types.ObjectId).toString()] = count
  }
  return counts
}

