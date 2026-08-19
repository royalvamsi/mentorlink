import { Schema, model, Document, Types } from 'mongoose'

export interface IAvailability extends Document {
  mentorId: Types.ObjectId
  startTime: Date    // UTC
  endTime: Date      // UTC
  isBooked: boolean
  createdAt: Date
  updatedAt: Date
}

const availabilitySchema = new Schema<IAvailability>(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime:   { type: Date, required: true },
    isBooked:  { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Compound index for mentor + time range queries
availabilitySchema.index({ mentorId: 1, startTime: 1 })

const Availability = model<IAvailability>('Availability', availabilitySchema)
export default Availability
