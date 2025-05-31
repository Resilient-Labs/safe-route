const cloudinary = require("../middleware/cloudinary");
const { Post, PostUserDownvoteSchema, PostUserUpvoteSchema } = require("../models/Post");
const Comment = require("../models/Comment");
const { User, Bookmark } = require("../models/User");

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
      if (!post) {
      res.status(404).send('Sorry, the page you are looking for does not exist.');
    }
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
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
    try {
      const post = await Post.findById(req.params.id)
      const upVoteHash = post.generateUserHash(req.user.id)
      const checkUpVote = await PostUserUpvoteSchema.findById(upVoteHash)
      if(!checkUpVote){
        await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { upvotes: 1 },
        }
      )
     const upVote = await PostUserUpvoteSchema.create({
        user: req.user.id,
        post: req.params.id,
        _id:  upVoteHash,
      })
      console.log(upVote)
      res.redirect('back')
      }else{
        await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { upvotes: -1 },
        }
        )
        await PostUserUpvoteSchema.findByIdAndDelete(upVoteHash)
        console.log('upvote has been removed')
        res.redirect('back')
      }
      res.redirect(`/back/${req.params.id}`);
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
