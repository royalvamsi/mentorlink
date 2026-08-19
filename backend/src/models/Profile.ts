import { Schema, model, Document, Types } from 'mongoose'

export interface IProfile extends Document {
  userId: Types.ObjectId
  avatarUrl?: string
  department?: string
  year?: string
  bio?: string
  skills: string[]
  academicInterests: string[]
  careerInterests: string[]
  mentorshipGoals?: string
  availabilityNote?: string
  linkedIn?: string
  github?: string
  createdAt: Date
  updatedAt: Date
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    avatarUrl: { type: String, trim: true },
    department: { type: String, trim: true, maxlength: 100 },
    year: {
      type: String,
      enum: ['1st', '2nd', '3rd', '4th', 'Alumni', ''],
    },
    bio: { type: String, trim: true, maxlength: 500 },
    skills: [{ type: String, trim: true }],
    academicInterests: [{ type: String, trim: true }],
    careerInterests: [{ type: String, trim: true }],
    mentorshipGoals: { type: String, trim: true, maxlength: 300 },
    availabilityNote: { type: String, trim: true, maxlength: 200 },
    linkedIn: { type: String, trim: true },
    github: { type: String, trim: true },
  },
  { timestamps: true }
)

// Indexes for mentor discovery queries
profileSchema.index({ skills: 1 })
profileSchema.index({ department: 1 })
profileSchema.index({ academicInterests: 1 })

const Profile = model<IProfile>('Profile', profileSchema)
export default Profile
