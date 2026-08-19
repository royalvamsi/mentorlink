import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import { authorizeRoles } from '../middleware/authorizeRoles'
import {
  addAvailability,
  listAvailability,
  editAvailability,
  removeAvailability,
  bookSlot,
  listBookings,
  getBooking,
  patchBooking,
} from '../controllers/scheduling.controller'

const router = Router()
router.use(verifyToken)

// Availability (mentors & admins only)
router.post('/availability', authorizeRoles('SENIOR', 'ALUMNI', 'ADMIN'), addAvailability)
router.get('/availability/:mentorId', listAvailability)
router.put('/availability/:id', authorizeRoles('SENIOR', 'ALUMNI', 'ADMIN'), editAvailability)
router.delete('/availability/:id', authorizeRoles('SENIOR', 'ALUMNI', 'ADMIN'), removeAvailability)

// Bookings
router.post('/bookings', bookSlot)
router.get('/bookings', listBookings)
router.get('/bookings/:id', getBooking)
router.patch('/bookings/:id', patchBooking)

export default router
