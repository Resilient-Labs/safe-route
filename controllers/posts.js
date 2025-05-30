const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");

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
      const post = await Post.findById(req.params.id);
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
      const postData = { ...req.body };
      let result = null;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path, { asset_folder: 'safeRouteImages', public_id_prefix: 'post'  });
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
};
