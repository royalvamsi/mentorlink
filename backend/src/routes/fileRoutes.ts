import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { upload } from '../config/upload'
import { uploadFile, getFiles, downloadFile, removeFile } from '../controllers/file.controller'

const router = Router()
router.use(verifyToken)

router.post('/upload', upload.single('file'), uploadFile)
router.get('/', getFiles)
router.get('/download/:id', downloadFile)
router.delete('/:id', removeFile)

export default router
