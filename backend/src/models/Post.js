const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: 5000,
  },
  mediaUrls: [{
    type: String,
  }],
  visibility: {
    type: String,
    enum: ['public', 'friends', 'custom', 'only_me'],
    default: 'public',
  },
  customAudience: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ visibility: 1 });

module.exports = mongoose.model('Post', postSchema);
