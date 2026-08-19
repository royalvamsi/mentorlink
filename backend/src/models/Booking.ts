import { Schema, model, Document, Types } from 'mongoose'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'

export interface IBooking extends Document {
  mentorId: Types.ObjectId
  menteeId: Types.ObjectId
  availabilityId: Types.ObjectId
  mentorshipId?: Types.ObjectId
  startTime: Date
  endTime: Date
  status: BookingStatus
  cancelledBy?: Types.ObjectId
  cancellationReason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>(
  {
    mentorId:           { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    menteeId:           { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    availabilityId:     { type: Schema.Types.ObjectId, ref: 'Availability', required: true },
    mentorshipId:       { type: Schema.Types.ObjectId, ref: 'Mentorship' },
    startTime:          { type: Date, required: true },
    endTime:            { type: Date, required: true },
    status:             {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'PENDING',
      index: true,
    },
    cancelledBy:        { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    notes:              { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
)

bookingSchema.index({ mentorId: 1, startTime: 1 })
bookingSchema.index({ menteeId: 1, startTime: 1 })
bookingSchema.index({ availabilityId: 1 }, { unique: true }) // one booking per slot

const Booking = model<IBooking>('Booking', bookingSchema)
export default Booking
