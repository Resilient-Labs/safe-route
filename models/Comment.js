const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  commentText: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
    required: true,
  },
  likeBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
