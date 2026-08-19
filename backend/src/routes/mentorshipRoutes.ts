import { Router } from 'express'
import { createRequest, cancel, accept, reject, incoming, sent, active } from '../controllers/mentorship.controller'
import { verifyToken } from '../middleware/verifyToken'

const router = Router()

router.use(verifyToken)

router.post('/request', createRequest)
router.delete('/request/:id', cancel)
router.put('/request/:id/accept', accept)
router.put('/request/:id/reject', reject)
router.get('/requests', incoming)
router.get('/sent', sent)
router.get('/active', active)

export default router
