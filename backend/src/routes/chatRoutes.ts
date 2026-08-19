import { Router } from 'express'
import { openConversation, listConversations, fetchMessages, readMessages, unreadCounts } from '../controllers/chat.controller'
import { verifyToken } from '../middleware/verifyToken'

const router = Router()
router.use(verifyToken)

router.post('/conversations', openConversation)
router.get('/conversations', listConversations)
router.get('/conversations/:conversationId/messages', fetchMessages)
router.put('/conversations/:conversationId/read', readMessages)
router.get('/unread', unreadCounts)

export default router
