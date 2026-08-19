import { api } from './authService'

export interface ConversationUser {
  _id: string
  name: string
  email: string
  role: string
}

export interface Conversation {
  _id: string
  participants: ConversationUser[]
  lastMessage?: string
  lastMessageAt?: string
  updatedAt: string
}

export interface Message {
  _id: string
  conversationId: string
  senderId: ConversationUser | string
  content: string
  readBy: string[]
  createdAt: string
}

export const chatService = {
  async openConversation(userId: string): Promise<Conversation> {
    const res = await api.post<{ status: string; data: Conversation }>('/api/chat/conversations', { userId })
    return res.data.data
  },
  async getConversations(): Promise<Conversation[]> {
    const res = await api.get<{ status: string; data: Conversation[] }>('/api/chat/conversations')
    return res.data.data
  },
  async getMessages(conversationId: string, page = 1): Promise<Message[]> {
    const res = await api.get<{ status: string; data: Message[] }>(`/api/chat/conversations/${conversationId}/messages`, { params: { page } })
    return res.data.data
  },
  async markRead(conversationId: string): Promise<void> {
    await api.put(`/api/chat/conversations/${conversationId}/read`)
  },
  async getUnreadCounts(): Promise<Record<string, number>> {
    const res = await api.get<{ status: string; data: Record<string, number> }>('/api/chat/unread')
    return res.data.data
  },
}
