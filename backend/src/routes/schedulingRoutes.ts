import { Router } from 'express'
import { verifyToken } from '../middleware/verifyToken'
import {
  addAvailability, listAvailability, editAvailability, removeAvailability,
  bookSlot, listBookings, getBooking, patchBooking,
} from '../controllers/scheduling.controller'

const router = Router()
router.use(verifyToken)

// Availability
router.post('/availability', addAvailability)
router.get('/availability/:mentorId', listAvailability)
router.put('/availability/:id', editAvailability)
router.delete('/availability/:id', removeAvailability)

// Bookings
router.post('/bookings', bookSlot)
router.get('/bookings', listBookings)
router.get('/bookings/:id', getBooking)
router.patch('/bookings/:id', patchBooking)

export default router
