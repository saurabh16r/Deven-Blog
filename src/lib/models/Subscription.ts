import mongoose, { Schema } from 'mongoose';

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'expired',
    },
    paymentProvider: {
      type: String,
      default: 'razorpay',
    },
    paymentId: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.index({ userId: 1 });
SubscriptionSchema.index({ status: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
