import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { listPosts, getPost, postCreate, postUpdate, postDelete, upvotePost, listComments, commentCreate, commentDelete } from '../controllers/forum.controller'

const router = Router()
router.use(verifyToken)

// Posts
router.get('/', listPosts)
router.post('/', postCreate)
router.get('/:id', getPost)
router.put('/:id', postUpdate)
router.delete('/:id', postDelete)
router.post('/:id/upvote', upvotePost)

// Comments
router.get('/:postId/comments', listComments)
router.post('/:postId/comments', commentCreate)
router.delete('/comments/:id', commentDelete)

export default router
