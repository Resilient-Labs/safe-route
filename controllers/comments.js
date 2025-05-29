const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
      console.log('we made it')
      await Comment.create({
        commentText: req.body.comment,
        likes: 0,
        user: req.user.id,
        post: req.params.rainbowUnicorn
      });
      console.log("Comment has been added!");
      res.redirect("/post/" + req.params.rainbowUnicorn);
    } catch (err) {
      console.log(err);
    }
  },
  likeComment: async (req, res) => {
    try {
      await Comment.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect('back');
    } catch (err) {
      console.log(err);
    }
  },
  deleteComment: async (req, res) => {
    try {
      // let comment = await Post.findById({ _id: req.params.id });
      // Delete comment from db
      await Comment.findByIdAndDelete({ _id: req.params.id });
      console.log("Deleted Comment");
      res.redirect("back");
    } catch (err) {
      res.redirect("back");
    }
  },
};
