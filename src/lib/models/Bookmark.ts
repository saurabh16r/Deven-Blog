import mongoose, { Schema } from 'mongoose';

const BookmarkSchema = new Schema(
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
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique bookmarks per user and fast retrieval
BookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, savedAt: -1 });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);
