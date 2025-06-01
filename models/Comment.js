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

  // To see who was like by
  likeBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
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