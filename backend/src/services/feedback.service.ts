import Feedback from '../models/Feedback'
import Booking from '../models/Booking'
import { Types } from 'mongoose'

export class FeedbackError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message); this.name = 'FeedbackError'
  }
}

export async function submitFeedback(
  bookingId: string,
  reviewerId: string,
  rating: number,
  comment?: string,
  isPublic = true
) {
  if (rating < 1 || rating > 5) throw new FeedbackError(400, 'Rating must be between 1 and 5')

  const booking = await Booking.findById(bookingId)
  if (!booking) throw new FeedbackError(404, 'Booking not found')
  if (booking.status !== 'COMPLETED') throw new FeedbackError(400, 'Feedback can only be submitted for completed sessions')

  const isMentor = booking.mentorId.toString() === reviewerId
  const isMentee = booking.menteeId.toString() === reviewerId
  if (!isMentor && !isMentee) throw new FeedbackError(403, 'Access denied')

  const revieweeId = isMentor ? booking.menteeId : booking.mentorId

  try {
    const feedback = await Feedback.create({
      bookingId: new Types.ObjectId(bookingId),
      reviewerId: new Types.ObjectId(reviewerId),
      revieweeId,
      mentorshipId: booking.mentorshipId,
      rating,
      comment,
      isPublic,
    })
    return feedback
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      throw new FeedbackError(409, 'You have already submitted feedback for this session')
    }
    throw err
  }
}

export async function getUserFeedback(userId: string) {
  return Feedback.find({ revieweeId: new Types.ObjectId(userId), isPublic: true })
    .populate('reviewerId', 'name role')
    .populate('bookingId', 'startTime endTime')
    .sort({ createdAt: -1 })
    .lean()
}

export async function getUserAverageRating(userId: string) {
  const result = await Feedback.aggregate([
    { $match: { revieweeId: new Types.ObjectId(userId), isPublic: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (!result.length) return { avgRating: null, count: 0 }
  return { avgRating: Number(result[0].avgRating.toFixed(1)), count: result[0].count as number }
}

export async function getMySubmittedFeedback(reviewerId: string) {
  return Feedback.find({ reviewerId: new Types.ObjectId(reviewerId) })
    .populate('revieweeId', 'name role')
    .populate('bookingId', 'startTime endTime')
    .sort({ createdAt: -1 })
    .lean()
}
