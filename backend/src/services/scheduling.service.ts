import Availability from '../models/Availability'
import Booking, { type IBooking } from '../models/Booking'
import { Types } from 'mongoose'


export class SchedulingError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'SchedulingError'
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function createAvailability(
  mentorId: string,
  startTime: Date,
  endTime: Date
) {
  if (startTime >= endTime) {
    throw new SchedulingError(400, 'startTime must be before endTime')
  }
  if (startTime <= new Date()) {
    throw new SchedulingError(400, 'Cannot create availability in the past')
  }

  // Check for overlapping slots for same mentor
  const overlap = await Availability.findOne({
    mentorId: new Types.ObjectId(mentorId),
    isBooked: false,
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime:   { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  })
  if (overlap) {
    throw new SchedulingError(409, 'This time slot overlaps with an existing availability slot')
  }

  return Availability.create({
    mentorId: new Types.ObjectId(mentorId),
    startTime,
    endTime,
  })
}

export async function getMentorAvailability(mentorId: string, fromNow = true) {
  const query: Record<string, unknown> = {
    mentorId: new Types.ObjectId(mentorId),
    isBooked: false,
  }
  if (fromNow) query['startTime'] = { $gt: new Date() }
  return Availability.find(query).sort({ startTime: 1 }).lean()
}

export async function updateAvailability(
  id: string,
  mentorId: string,
  startTime: Date,
  endTime: Date
) {
  const slot = await Availability.findById(id)
  if (!slot) throw new SchedulingError(404, 'Slot not found')
  if (slot.mentorId.toString() !== mentorId) throw new SchedulingError(403, 'Forbidden')
  if (slot.isBooked) throw new SchedulingError(400, 'Cannot modify a booked slot')
  if (startTime >= endTime) throw new SchedulingError(400, 'startTime must be before endTime')
  if (startTime <= new Date()) throw new SchedulingError(400, 'Cannot set availability in the past')

  slot.startTime = startTime
  slot.endTime = endTime
  await slot.save()
  return slot
}

export async function deleteAvailability(id: string, mentorId: string) {
  const slot = await Availability.findById(id)
  if (!slot) throw new SchedulingError(404, 'Slot not found')
  if (slot.mentorId.toString() !== mentorId) throw new SchedulingError(403, 'Forbidden')
  if (slot.isBooked) throw new SchedulingError(400, 'Cannot delete a booked slot')
  await slot.deleteOne()
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function createBooking(menteeId: string, availabilityId: string, notes?: string) {
  const slot = await Availability.findById(availabilityId)
  if (!slot) throw new SchedulingError(404, 'Availability slot not found')
  if (slot.isBooked) throw new SchedulingError(409, 'This slot has already been booked')
  if (slot.startTime <= new Date()) throw new SchedulingError(400, 'Cannot book a past slot')
  if (slot.mentorId.toString() === menteeId) throw new SchedulingError(400, 'Cannot book your own slot')

  // Mark slot as booked atomically
  const updated = await Availability.findOneAndUpdate(
    { _id: slot._id, isBooked: false },
    { isBooked: true },
    { new: true }
  )
  if (!updated) throw new SchedulingError(409, 'Slot was just booked by someone else')

  const booking = await Booking.create({
    mentorId: slot.mentorId,
    menteeId: new Types.ObjectId(menteeId),
    availabilityId: slot._id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: 'CONFIRMED',
    notes,
  })

  return Booking.findById(booking._id)
    .populate('mentorId', 'name email role')
    .populate('menteeId', 'name email role')
    .lean()
}

export async function getBookings(userId: string, role: 'mentor' | 'mentee' | 'all' = 'all') {
  const filter: Record<string, unknown> = {}
  if (role === 'mentor') filter['mentorId'] = new Types.ObjectId(userId)
  else if (role === 'mentee') filter['menteeId'] = new Types.ObjectId(userId)
  else filter['$or'] = [{ mentorId: new Types.ObjectId(userId) }, { menteeId: new Types.ObjectId(userId) }]

  return Booking.find(filter)
    .populate('mentorId', 'name email role')
    .populate('menteeId', 'name email role')
    .sort({ startTime: 1 })
    .lean()
}

export async function getBookingById(id: string, userId: string) {
  const booking = await Booking.findById(id)
    .populate('mentorId', 'name email role')
    .populate('menteeId', 'name email role')
    .lean()
  if (!booking) throw new SchedulingError(404, 'Booking not found')
  const mid = (booking.mentorId as { _id: Types.ObjectId })._id.toString()
  const meid = (booking.menteeId as { _id: Types.ObjectId })._id.toString()
  if (mid !== userId && meid !== userId) throw new SchedulingError(403, 'Access denied')
  return booking
}

export async function updateBookingStatus(
  id: string,
  userId: string,
  userRole: string,
  status: string,
  cancellationReason?: string
) {
  const booking = await Booking.findById(id)
  if (!booking) throw new SchedulingError(404, 'Booking not found')

  const isMentor = booking.mentorId.toString() === userId
  const isMentee = booking.menteeId.toString() === userId

  if (!isMentor && !isMentee) throw new SchedulingError(403, 'Access denied')

  const allowed: Record<string, string[]> = {
    CONFIRMED:  isMentor ? ['CANCELLED', 'COMPLETED', 'NO_SHOW'] : ['CANCELLED'],
    PENDING:    isMentor ? ['CONFIRMED', 'CANCELLED'] : ['CANCELLED'],
    CANCELLED:  [],
    COMPLETED:  [],
    NO_SHOW:    [],
  }

  if (!(allowed[booking.status] ?? []).includes(status)) {
    throw new SchedulingError(400, `Cannot transition from ${booking.status} to ${status}`)
  }

  booking.status = status as IBooking['status']
  if (status === 'CANCELLED') {
    booking.cancelledBy = new Types.ObjectId(userId)
    if (cancellationReason) booking.cancellationReason = cancellationReason
    // Free up the slot
    await Availability.findByIdAndUpdate(booking.availabilityId, { isBooked: false })
  }
  await booking.save()
  return booking
}
