const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
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
      // const posts = await Post.find().sort({ createdAt: "desc" }).lean(); // Removed logic, rendering bare page
      res.render("feed.ejs") // , { posts: posts });
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
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
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
