import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserRole, USER_ROLES } from '../types/auth.types'

// ─── Document Interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  /** Instance method: compares a plain-text password against the stored hash. */
  comparePassword(candidate: string): Promise<boolean>
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name must be at most 80 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true, // normalises on save
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: `Role must be one of: ${USER_ROLES.join(', ')}`,
      },
      required: [true, 'Role is required'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
)

// ─── Pre-save Hook: Hash Password ─────────────────────────────────────────────

userSchema.pre<IUser>('save', async function () {
  // Only hash when the password field is new or modified
  if (!this.isModified('password')) return

  const SALT_ROUNDS = 12
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
})

// ─── Instance Method: Compare Password ───────────────────────────────────────

userSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

// ─── Indexes ─────────────────────────────────────────────────────────────────

// email is already indexed by `unique: true`
// Add further indexes here when querying by other fields becomes frequent

// ─── Model ───────────────────────────────────────────────────────────────────

const User = model<IUser>('User', userSchema)

export default User
