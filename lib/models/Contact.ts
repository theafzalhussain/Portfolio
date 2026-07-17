import { Schema, model, models, type InferSchemaType } from 'mongoose'

const ContactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    // Best-effort metadata, useful later if you ever need to spot spam.
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }, // adds createdAt / updatedAt automatically
)

export type ContactDocument = InferSchemaType<typeof ContactSchema>

// `models.Contact` re-use prevents Mongoose's "OverwriteModelError" that
// happens in Next.js dev mode when this module gets hot-reloaded.
export const Contact = models.Contact || model('Contact', ContactSchema)

export default Contact
