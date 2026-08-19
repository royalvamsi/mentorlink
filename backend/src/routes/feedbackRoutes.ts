import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { postFeedback, getFeedbackForUser, getSubmitted } from '../controllers/feedback.controller'

const router = Router()
router.use(verifyToken)

router.post('/', postFeedback)
router.get('/submitted', getSubmitted)
router.get('/user/:userId', getFeedbackForUser)

export default router
