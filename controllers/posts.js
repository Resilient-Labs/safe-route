const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");
const { User, Bookmark } = require("../models/User");
const validator = require("validator");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { 
      title: "SafeRoute | Profile",
      currentPage: "profile",
      posts: posts,
      user: req.user});
    } catch (err) {
      console.log(err);
    }
  },
  getFeedPage: async (req, res) => {
    try {
      const filters = {
        isHidden: false,
        isResolved: false,
      };
      if (req.body.type) {
        filters[type] = req.body.type;
      };
      const posts = await Post.find(filters); // Removed the lean()
      console.log(posts);
      res.render("feed.ejs", {
      title: "SafeRoute | Feed",
      currentPage: "feed",
      posts,
      user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPostPage: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
      res.status(404).json({
        message: "The post does not exist or has been removed."
      });
    }
    const comments = await Comment.find({ post: req.params.id , isHidden: false }).sort({ createdAt: -1 }); // Removed the lean()
      res.render("post.ejs", {
      title: "SafeRoute | Post",
      currentPage: "post",
      post: post, 
      user: req.user, 
      comments: comments });
    } catch (err) {
      console.log(err)
    }
  },
  createPost: async (req, res) => {
    if (!req.user) {
      return redirect('/map');
    };
    try {
      const postData = {
        ...req.body,
        postedBy: req.user.id
      };
      let result = null;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path, { asset_folder: 'safeRouteImages', public_id_prefix: 'post' });
        postData['image'] = result.secure_url;
        postData['cloudinaryId'] = result.public_id
      }

      await Post.create({ ...postData });
      res.redirect("back");
    } catch (err) {
      console.log(err);
      res.redirect("back");
    }
  },
  upvotePost: async (req, res) => {
    if (!req.user) {
      res.status(401).json({
        message: 'You must be logged in to access upvotes',
        error: 'The user must be logged in to access upvote'
      });
    };

    try {
      const post = await Post.findById(req.params.id)
      const upVoteHash = post.generateUserHash(req.user.id);
      const checkUpVote = await PostUserUpvoteSchema.findById(upVoteHash);
      if (!checkUpVote) {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: 1 } }
        );
        const upvote = await PostUserUpvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id:  upVoteHash,
        });
        res.json({
          message: 'Post successfully upvoted',
          post
        });
      } else {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: -1 } }
        );
        const upvote = await PostUserUpvoteSchema.findByIdAndDelete(upVoteHash);
        res.json({
          message: 'Upvote removed from post',
          post
        });
      }
    } catch(err) {
      res.status(500).json({
        message: 'An error occured while changing upvote status',
        error: err.message
      });
    }
  },
  downvotePost: async (req, res) => {
    if (!req.user) {
      res.status(401).json({
        message: 'You must be logged in to access downvote',
        error: 'The user must be logged in to access downvote'
      });
    }

    try {
      const post = await Post.findById(req.params.id)
      const downVoteHash = post.generateUserHash(req.user.id);
      const checkDownVote = await PostUserDownvoteSchema.findById(downVoteHash);
      if (!checkDownVote) {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: 1 } }
        );
        const downvote = await PostUserDownvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id:  downVoteHash
        });
        res.json({
          message: 'Post successfully downvoted',
          post
        });
      } else {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: -1 } }
        );
        const downvote = await PostUserDownvoteSchema.findByIdAndDelete(downVoteHash);
        res.json({
          message: 'Downvote removed from post',
          post
        });
      }
    } catch(err) {
      res.status(500).json({
        message: 'An error occured while changing downvote status',
        error: err.message
      });
    }
  },
  bookmarkPost: async (req, res) => {
    const postId = req.params.id;
    if (!req.user) {
      res.status(401).json({
        message: 'You must be logged in to use bookmark',
        error: 'The user must be logged in to use bookmark'
      });
    }

    try {
      const user = await User.findById(req.user.id);
      const boomarkHash = user.generatePostHash(postId);
      const existingBookmark = await Bookmark.findById(boomarkHash);
      if (existingBookmark) {
        await Bookmark.findOneAndDelete({
          _id: boomarkHash
        });
        res.json({
          message: 'Bookmark successfully removed',
        });
      } else {
        const newBookmark = await Bookmark.create({
          _id: boomarkHash,
          user: req.user.id,
          post: postId
        });
        res.json({
          message: 'Bookmark successfully added'
        });
      }
    } catch (err) {
      res.status(500).json({
        message: 'An error occured while updating bookmark status',
        error: err.message
      });
    };
  },
  deletePost: async (req, res) => {
    try {
      let post = await Post.findById({ _id: req.params.id });

      if (req.user._id.toString() === post.user.toString()) {
        if (post.cloudinaryId) {
          await cloudinary.uploader.destroy(post.cloudinaryId);
        }

        await Bookmark.deleteMany(
          { post: req.params.id }
        );
        await Comment.find(
          { post: req.params.id },
          { $set: { isHidden:true } }
        );
        await Post.findByIdAndUpdate(
          req.params.id,
          { isHidden: true }
        );

        res.json({
          message: 'Post successfully deleted',
          post
        });
      } else {
        res.status(401).json({
          message: 'You are not authorized to delete this post, or it has already been deleted',
          error: 'The user must own the post to delete it'
        });
      }
    } catch (err) {
      res.status(500).json({
        message: 'An error occured while deleting the post',
        error: err.message
      });
    }
  }
}
