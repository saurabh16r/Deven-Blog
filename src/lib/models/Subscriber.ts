import mongoose, { Schema } from 'mongoose';

const SubscriberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Subscriber || mongoose.model('Subscriber', SubscriberSchema);
