const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  description: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  address: String,
  latitude: String,
  longitude: String,
  time: Date,
  city: String,
  isResolved: Boolean,
  isHidden: Boolean,
  isAnonymous: Boolean,
  isVerified: Boolean,
  type: AlertSchema,
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  }
});

PostSchema.methods.generateUserHash = function (userId) {
  return userId + String(this._id);
}

const UserPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },
  _id: {
    type: String,
    unique: true,
    required: true,
  },
})

const PostUserDownvotesSchema = new mongoose.Schema(UserPostSchema);

const PostUserUpvotesSchema = new mongoose.Schema(UserPostSchema);


module.exports = {
  Post: mongoose.model("Post", PostSchema),
  PostUserDownvoteSchema: mongoose.model("PostUserDownvote", PostUserDownvotesSchema),
  PostUserUpvoteSchema: mongoose.model("PostUserUpvote", PostUserUpvotesSchema),
  UserPostSchema,
};
