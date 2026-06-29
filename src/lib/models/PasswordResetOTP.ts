import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  attempts: number;
}

const PasswordResetOTPSchema = new Schema<IPasswordResetOTP>({
  email: { type: String, required: true, lowercase: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // TTL Index Field
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 }
});

// TTL index to delete the document after current time passes expiresAt
PasswordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordResetOTP || 
  mongoose.model<IPasswordResetOTP>('PasswordResetOTP', PasswordResetOTPSchema);
