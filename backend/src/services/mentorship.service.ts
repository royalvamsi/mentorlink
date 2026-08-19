import MentorshipRequest from '../models/MentorshipRequest'
import Mentorship from '../models/Mentorship'
import User from '../models/User'
import { Types } from 'mongoose'

export class MentorshipServiceError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
    this.name = 'MentorshipServiceError'
  }
}

export async function sendRequest(menteeId: string, mentorId: string, message?: string) {
  if (menteeId === mentorId) throw new MentorshipServiceError(400, 'You cannot send a mentorship request to yourself')

  const mentor = await User.findById(mentorId)
  if (!mentor || !['SENIOR', 'ALUMNI'].includes(mentor.role)) {
    throw new MentorshipServiceError(404, 'Mentor not found')
  }

  // Check for existing pending request
  const existing = await MentorshipRequest.findOne({
    menteeId: new Types.ObjectId(menteeId),
    mentorId: new Types.ObjectId(mentorId),
    status: 'PENDING',
  })
  if (existing) throw new MentorshipServiceError(409, 'You already have a pending request with this mentor')

  // Check for active mentorship
  const activeMentorship = await Mentorship.findOne({
    menteeId: new Types.ObjectId(menteeId),
    mentorId: new Types.ObjectId(mentorId),
    status: 'ACTIVE',
  })
  if (activeMentorship) throw new MentorshipServiceError(409, 'You already have an active mentorship with this mentor')

  const req = await MentorshipRequest.create({
    menteeId: new Types.ObjectId(menteeId),
    mentorId: new Types.ObjectId(mentorId),
    message,
  })
  return req
}

export async function cancelRequest(menteeId: string, requestId: string) {
  const req = await MentorshipRequest.findById(requestId)
  if (!req) throw new MentorshipServiceError(404, 'Request not found')
  if (req.menteeId.toString() !== menteeId) throw new MentorshipServiceError(403, 'Forbidden')
  if (req.status !== 'PENDING') throw new MentorshipServiceError(400, 'Only pending requests can be cancelled')
  req.status = 'CANCELLED'
  await req.save()
  return req
}

export async function acceptRequest(mentorId: string, requestId: string) {
  const req = await MentorshipRequest.findById(requestId)
  if (!req) throw new MentorshipServiceError(404, 'Request not found')
  if (req.mentorId.toString() !== mentorId) throw new MentorshipServiceError(403, 'Forbidden')
  if (req.status !== 'PENDING') throw new MentorshipServiceError(400, 'Request is no longer pending')

  req.status = 'ACCEPTED'
  await req.save()

  const mentorship = await Mentorship.create({
    menteeId: req.menteeId,
    mentorId: req.mentorId,
    requestId: req._id,
  })
  return { request: req, mentorship }
}

export async function rejectRequest(mentorId: string, requestId: string) {
  const req = await MentorshipRequest.findById(requestId)
  if (!req) throw new MentorshipServiceError(404, 'Request not found')
  if (req.mentorId.toString() !== mentorId) throw new MentorshipServiceError(403, 'Forbidden')
  if (req.status !== 'PENDING') throw new MentorshipServiceError(400, 'Request is no longer pending')
  req.status = 'REJECTED'
  await req.save()
  return req
}

export async function getIncomingRequests(mentorId: string) {
  return MentorshipRequest.find({ mentorId: new Types.ObjectId(mentorId), status: 'PENDING' })
    .populate('menteeId', 'name email role')
    .sort({ createdAt: -1 })
    .lean()
}

export async function getSentRequests(menteeId: string) {
  return MentorshipRequest.find({ menteeId: new Types.ObjectId(menteeId) })
    .populate('mentorId', 'name email role')
    .sort({ createdAt: -1 })
    .lean()
}

export async function getActiveMentorships(userId: string) {
  return Mentorship.find({
    $or: [{ menteeId: new Types.ObjectId(userId) }, { mentorId: new Types.ObjectId(userId) }],
    status: 'ACTIVE',
  })
    .populate('menteeId', 'name email role')
    .populate('mentorId', 'name email role')
    .sort({ startedAt: -1 })
    .lean()
}
