import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { listNotifications, readNotification, readAll, removeNotification } from '../controllers/notification.controller'

const router = Router()
router.use(verifyToken)

router.get('/', listNotifications)
router.patch('/:id/read', readNotification)
router.patch('/read-all', readAll)
router.delete('/:id', removeNotification)

export default router
