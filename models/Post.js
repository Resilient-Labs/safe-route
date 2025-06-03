const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null
  },
  cloudinaryId: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    default: null
  },
  time: {
    type: Date,
    default: Date.now
  },
  city: {
    type: String,
    default: null
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: null
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  }
});

PostSchema.index({ location: '2dsphere' });
PostSchema.methods.generateUserHash = function (userId) {
  return userId + String(this._id);
};

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
    required: true,
  },
});

const PostUserDownvotesSchema = new mongoose.Schema(UserPostSchema);

const PostUserUpvotesSchema = new mongoose.Schema(UserPostSchema);


module.exports = {
  Post: mongoose.model("Post", PostSchema),
  PostUserDownvoteSchema: mongoose.model("PostUserDownvote", PostUserDownvotesSchema),
  PostUserUpvoteSchema: mongoose.model("PostUserUpvote", PostUserUpvotesSchema),
  UserPostSchema,
};
