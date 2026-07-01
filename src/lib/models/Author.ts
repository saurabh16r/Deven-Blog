import mongoose, { Schema } from 'mongoose';

const AuthorSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, required: true }, // Cloudinary secure_url
  bio: { type: String, required: true, maxlength: 200 },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  website: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Author || mongoose.model('Author', AuthorSchema);
