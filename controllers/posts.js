const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");
const { User, Bookmark } = require("../models/User");


module.exports = {
  getFeed: async (req, res) => {
    try {
      const filter = {
        isHidden: false,
        isResolved: false
      };
      if (req.query.type || req.body.type) {
        filter.type = req.query.type || req.body.type;
      };

      if (req.query.since) {
        const sinceDate = new Date(req.query.since);
        if (!isNaN(sinceDate)) {
          filter.createdAt = { $gte: sinceDate };
        };
      };

      const { swLat, swLng, neLat, neLng } = req.query;

      if (swLat && swLng && neLat && neLng) {
        const southwest = [parseFloat(swLng), parseFloat(swLat)];
        const northeast = [parseFloat(neLng), parseFloat(neLat)];
        if (
          southwest.every(Number.isFinite) &&
          northeast.every(Number.isFinite)
        ) {
          filter.location = {
            $geoWithin: {
              $box: [southwest, northeast]
            }
          };
        };
      };

      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      res.status(200).json({
        message: "Successfully fetched posts",
        posts
      });
    } catch (err) {
      console.error('Error in getFeed:', err);
      res.status(500).json({
        message: 'There was an error while getting all posts',
        error: 'Server error'
      });
    };
  },
  getFeedPage: async (req, res) => {
    try {
      const filters = {
        isHidden: false,
        isResolved: false,
      };
      if (req.body.type || req.query.type) {
        filters[type] = req.body.type || req.query.type;
      };
      const posts = await Post.aggregate([
        { $match: filters },
        {
          $addFields: {
            hasCurrentUserUpvoted: false,
            hasCurrentUserDownvoted: false,
            hasCurrentUserBookmarked: false
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
      const postIds = posts.map(post => post._id);

      if (!req.user) {
        return res.render("feed.ejs", {
          title: "SafeRoute | Feed",
          currentPage: "feed",
          user: req.user,
          posts
        });
      }

      const [upvotes, downvotes, bookmarks] = await Promise.all([
        PostUserUpvoteSchema.find({ user: req.user.id, post: { $in: postIds } }, 'post'),
        PostUserDownvoteSchema.find({ user: req.user.id, post: { $in: postIds } }, 'post'),
        Bookmark.find({ user: req.user.id, post: { $in: postIds } }, 'post')
      ]);

      const upvoteSet = new Set(upvotes.map(upvote => upvote.post.toString()));
      const downvoteSet = new Set(downvotes.map(doc => doc.post.toString()));
      const bookmarkSet = new Set(bookmarks.map(doc => doc.post.toString()));
      posts.forEach(post => {
        if (upvoteSet.has(post._id.toString())) {
          post.hasCurrentUserUpvoted = true;
        }
        if (downvoteSet.has(post._id.toString())) {
          post.hasCurrentUserDownvoted = true;
        }
        if (bookmarkSet.has(post._id.toString())) {
          post.hasCurrentUserBookmarked = true;
        }
      });

      return res.render("feed.ejs", {
        title: "SafeRoute | Feed",
        currentPage: "feed",
        user: req.user,
        posts
      });
    } catch (err) {
      console.log(err);
      req.flash("errors", {
        msg: "There was an error getting the feed page",
      });
      return res.redirect('/map');
    };
  },
  getPostPage: async (req, res) => {
    const validationErrors = [];
    try {
      const post = await Post.findById({
        _id: req.params.id,
        isHidden: false,
        isResolved: false
      });
      if (!post) {
        validationErrors.push({ msg: "Unable to fetch post" })
        if (validationErrors.length) {
          req.flash("errors", validationErrors);
          return res.redirect("back");
        };
      };
      const comments = await Comment.find({
        post: req.params.id, isHidden: false
      }).sort({ createdAt: -1 }).populate('user');

      if (!req.user) {
        return res.render("post.ejs", {
          title: "SafeRoute | Post",
          currentPage: "post",
          post: post,
          comments: comments,
          user: null
        });
      }

      const hash = post.generateUserHash(req.user.id);
      const bookmark = await Bookmark.findById(hash);
      const upvote = await PostUserUpvoteSchema.findById(hash);
      const downvote = await PostUserDownvoteSchema.findById(hash);

      return res.render("post.ejs", {
        title: "SafeRoute | Post",
        currentPage: "post",
        post: post,
        user: req.user,
        comments: comments,
        hasCurrentUserUpvoted: !upvote ? false : true,
        hasCurrentUserDownvoted: !downvote ? false : true,
        hasCurrentUserBookmarked: !bookmark ? false : true,
      });
      console.log(hasCurrentUserBookmarked)
    } catch (err) {
      console.log(err)
      res.redirect('back');
    }
  },
  createPost: async (req, res) => {
    const { latitude, longitude, ...rest } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      req.flash("errors", { msg: "Invalid coordinates provided." });
      return res.redirect("back");
    }

    if (!req.user) {
      req.flash("errors", { msg: "You must be signed in to create a post." });
      return res.redirect("back");
    }

    try {
      const postData = {
        ...rest,
        postedBy: req.user.id,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      };

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          asset_folder: 'safeRouteImages',
          public_id_prefix: 'post'
        });
        postData.image = result.secure_url;
        postData.cloudinaryId = result.public_id;
      }

      await Post.create(postData);

      req.flash("success", { msg: "Post created successfully." });
      res.redirect("back");
    } catch (err) {
      console.error(err);
      req.flash("errors", { msg: "An error occurred while creating the post." });
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
        const removeDownVote = await PostUserDownvoteSchema.findByIdAndDelete(upVoteHash);
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: 1, downvotes: removeDownVote ? -1 : 0 } },
          { new: true }
        );
        const upvote = await PostUserUpvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id: upVoteHash,
        });
        res.json({
          message: 'Post successfully upvoted',
          downvoteChanged: removeDownVote ? true : false,
          post
        });
      } else {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: -1 } },
          { new: true }
        );
        const upvote = await PostUserUpvoteSchema.findByIdAndDelete(upVoteHash);
        res.json({
          message: 'Upvote removed from post',
          post
        });
      }
    } catch (err) {
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
      const removeUpVote = await PostUserUpvoteSchema.findByIdAndDelete(downVoteHash);
      if (!checkDownVote) {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: 1, upvotes: removeUpVote ? -1 : 0 } },
          { new: true }
        );
        const downvote = await PostUserDownvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id: downVoteHash
        });
        res.json({
          message: 'Post successfully downvoted',
          upvoteChanged: removeUpVote ? true : false,
          post
        });
      } else {
        const post = await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: -1 } },
          { new: true }
        );
        const downvote = await PostUserDownvoteSchema.findByIdAndDelete(downVoteHash);
        res.json({
          message: 'Downvote removed from post',
          post
        });
      }
    } catch (err) {
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

      if (req.user._id.toString() === post.postedBy.toString()) {
        if (post.cloudinaryId) {
          await cloudinary.uploader.destroy(post.cloudinaryId);
        }
        await Bookmark.deleteMany(
          { post: req.params.id }
        );
        await Comment.updateMany(
          { post: req.params.id },
          { $set: { isHidden: true } }
        );
        await Post.findByIdAndUpdate(
          req.params.id,
          { isHidden: true }
        );
        // res.json({
        //   message: 'Post successfully deleted',
        //   post
        // });
        res.redirect('/feed')
      } else {
        res.status(401).json({
          message: 'You are not authorized to delete this post, or it has already been deleted',
          error: 'The user must own the post to delete it'
        });
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: 'An error occured while deleting the post',
        error: err.message
      });
    }
  }
}      
