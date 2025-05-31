const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");
const Pin = require("../models/Pin");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const filters = {
        isHidden: false,
        isResolved: false,
      };
      if (req.body.type) {
        filters[type] = req.body.type;
      };
      const posts = await Post.find(filters).lean();
      console.log(posts);
      res.render("feed.ejs", { posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      // Find the post (Change the id to postID)
      const post = await Post.findById(req.params.postID);
      const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 }).lean();
      res.render("postView.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
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

      const post = await Post.create({ ...postData });
      console.log("Post has been added!");
      console.log(post);
      res.redirect("back");
    } catch (err) {
      console.log(err);
    }
  },
  upvotePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { upvotes: 1 },
        }
      );
      console.log("Upvote +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  downvotePost: async (req, res) => {
    try {
      // to make sure a user can only vote once: needs post and user defined, check and see if the post and user exist (if !post)
      // should the upvote be defined here too? 
      // define downvote (make sure it ".includes" user id
      // if the user has already downVoted (.pull(userid)) [this will "remove" downvote & not allow a duplicate?]
      // if the user has upvoted (.pull(userid)
      //  then .push downvote

      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { downvotes: 1 },
        }
      )
      console.log("Downvote +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  bookmarkPost: async (req, res) => {
    try {
      // TODO: implement actual bookmark logic
      console.log(`Bookmark placeholder hit for post ID: ${req.params.id}`);
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.error(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.findByIdAndDelete({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      console.log(err)
      res.redirect("/profile");
    }
  },
// Pending post pin 

  // The pin/un pin
  userPostPin: async (req, res) => {
    // Extract post and user IDs from request parameters
    const { postID, userID } = req.params;

    try {
      // Check if a pin for this user and post already exists
      let existingPin = await db.collection('pins').findOne({
        user_id: userID,
        post_id: postID
      });

      // If a pin exists, delete it (toggling the pin off)
      if (existingPin) {
        // Assuming 'Pin' is a Mongoose model, use findOneAndDelete for clarity
        await Pin.findOneAndDelete({
          user_id: userID,
          post_id: postID
        });
        console.log('Pin successfully deleted.');

      } else {
        // If no pin exists, create a new one (toggling the pin on)
        let newPin = new Pin({
          user: userID,
          post: postID
        });

        let savedPin = await newPin.save();
        console.log('New pin saved:', savedPin);
      }

    } catch (err) {
      console.error('Error updating pin status:', err);
      res.redirect('/profile'); // Redirect on error
    }
  }
};
