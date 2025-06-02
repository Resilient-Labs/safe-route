const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");
const { User, Bookmark } = require("../models/User");

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
  getFeed: async (req, res) => {
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
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
      res.status(404).send('Sorry, the page you are looking for does not exist.');
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

      const post = await Post.create({ ...postData });
      console.log("Post has been added!");
      console.log(post);
      res.redirect("back");
    } catch (err) {
      console.log(err);
    }
  },
  upvotePost: async (req, res) => {
    if (!req.user) {
      res.redirect(`/signin`);
    }

    try {
      const post = await Post.findById(req.params.id)
      const upVoteHash = post.generateUserHash(req.user.id);
      const checkUpVote = await PostUserUpvoteSchema.findById(upVoteHash);
      if (!checkUpVote) {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: 1 } }
        );
        await PostUserUpvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id:  upVoteHash,
        });
        res.redirect('back');
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { upvotes: -1 } }
        );
        await PostUserUpvoteSchema.findByIdAndDelete(upVoteHash);
        res.redirect('back');
      }
    } catch(err) {
      console.log(err);
      res.redirect('back');
    }
  },
  downvotePost: async (req, res) => {
    if (!req.user) {
      res.redirect(`/signin`);
    }

    try {
      const post = await Post.findById(req.params.id)
      const downVoteHash = post.generateUserHash(req.user.id);
      const checkDownVote = await PostUserDownvoteSchema.findById(downVoteHash);
      if (!checkDownVote) {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: 1 } }
        );
        await PostUserDownvoteSchema.create({
          user: req.user.id,
          post: req.params.id,
          _id:  downVoteHash
        });
        res.redirect('back');
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          { $inc: { downvotes: -1 } }
        );
        await PostUserDownvoteSchema.findByIdAndDelete(downVoteHash);
        res.redirect('back');
      }
    } catch(err) {
      console.log(err);
      res.redirect('back');
    }
  },
  bookmarkPost: async (req, res) => {
    const postId = req.params.id;
    if (!req.user) {
      res.redirect(`/signin`);
    }

    try {
      const user = await User.findById(req.user.id);
      const boomarkHash = user.generatePostHash(postId);
      const existingBookmark = await Bookmark.findById(boomarkHash);
      if (existingBookmark) {
        await Bookmark.findOneAndDelete({
          _id: boomarkHash
        });
        console.log('Bookmark removed.');
        res.redirect('back');
      } else {
        const newBookmark = await Bookmark.create({
          _id: boomarkHash,
          user: req.user.id,
          post: postId
        });
        console.log('Bookmark added:', newBookmark);
        res.redirect('back');
      }
    } catch (err) {
      console.error('Error updating bookmark status:', err);
      res.redirect('back'); // Redirect on error
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
    let post = await Post.findById({ _id: req.params.id });

    // Check if the logged-in user is the post owner
    if (req.user._id.toString() === post.user.toString()) {
      // Delete image from Cloudinary
      if (post.cloudinaryId){
      await cloudinary.uploader.destroy(post.cloudinaryId);
      }
      // Delete related bookmarks, 
      await Bookmark.deleteMany({ post: req.params.id });

      // Delete the post 
      await Post.findByIdAndUpdate({ _id: req.params.id, isHidden: true});

      // 'Delete' the comments
      await Comment.findByIdAndUpdate({_id: req.params.id, isHidden:true})

      console.log("Success! Your post has been deleted.");
      res.redirect("/feed");
    } else {
      console.log("You are not authorized to delete this post.");
      res.redirect(`/post/${req.params.id}`);
    }
  } catch (err) {
    console.log("Error deleting post:", err);
    res.redirect("/feed");
  }
}
}