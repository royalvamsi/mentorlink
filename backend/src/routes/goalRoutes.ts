import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { listGoals, getGoal, postGoal, patchGoal, removeGoal, checkMilestone, postMilestone } from '../controllers/goal.controller'

const router = Router()
router.use(verifyToken)

router.get('/', listGoals)
router.post('/', postGoal)
router.get('/:id', getGoal)
router.patch('/:id', patchGoal)
router.delete('/:id', removeGoal)
router.post('/:id/milestones', postMilestone)
router.patch('/:id/milestones/:milestoneId/toggle', checkMilestone)

export default router
