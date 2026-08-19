import { Schema, model, Document, Types } from 'mongoose'

export interface IFeedback extends Document {
  bookingId: Types.ObjectId
  reviewerId: Types.ObjectId
  revieweeId: Types.ObjectId
  mentorshipId?: Types.ObjectId
  rating: number         // 1-5
  comment?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const feedbackSchema = new Schema<IFeedback>(
  {
    bookingId:    { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    reviewerId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    revieweeId:   { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentorshipId: { type: Schema.Types.ObjectId, ref: 'Mentorship' },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, trim: true, maxlength: 1000 },
    isPublic:     { type: Boolean, default: true },
  },
  { timestamps: true }
)

// One review per reviewer per booking
feedbackSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true })

const Feedback = model<IFeedback>('Feedback', feedbackSchema)
export default Feedback
