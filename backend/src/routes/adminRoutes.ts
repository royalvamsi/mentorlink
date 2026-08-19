import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { requireAdmin } from '../middleware/requireAdmin'
import {
  createReport, listReports, patchReport,
  getUsers, patchUserRole, deletePost, deleteComment, adminStats,
} from '../controllers/admin.controller'

const router = Router()
router.use(verifyToken)

// Any authenticated user can report content
router.post('/reports', createReport)

// Admin-only routes
router.get('/stats', requireAdmin, adminStats)
router.get('/reports', requireAdmin, listReports)
router.patch('/reports/:id', requireAdmin, patchReport)
router.get('/users', requireAdmin, getUsers)
router.patch('/users/:id/role', requireAdmin, patchUserRole)
router.delete('/forum/posts/:id', requireAdmin, deletePost)
router.delete('/forum/comments/:id', requireAdmin, deleteComment)

export default router
