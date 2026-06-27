import mongoose, { Schema } from 'mongoose';

const ReadingHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    readPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for fast lookups by user and article
ReadingHistorySchema.index({ userId: 1, articleId: 1 }, { unique: true });
ReadingHistorySchema.index({ userId: 1, lastReadAt: -1 });

export default mongoose.models.ReadingHistory || mongoose.model('ReadingHistory', ReadingHistorySchema);
