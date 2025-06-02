const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
      const comment = await Comment.create({
        commentText: req.body.comment,
        likes: 0,
        user: req.user.id,
        post: req.params.id
      });
      res.json({
        message: 'Successfully added comment',
        comment
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to create comment",
        error: err.message
      });
    }
  },
  likeComment: async (req, res) => { 
    try {
      const commentID = req.params.id;
      const userID = req.user.id;

      const comment = await Comment.findById(commentID);
      if (!comment) {
        res.status(404).json({
          message: 'Comment not found, it may have been deleted',
          error: 'Unable to find comment',
        });
      };
      const userHasLike = comment.likeBy.includes(userID);

      let operation;
      if (userHasLike) {
        operation = {
          $inc: { likes: -1 },
          $pull: { likeBy: userID }
        }
      } else {
        operation = {
          $inc: { likes: 1 },
          $push: { likeBy: userID }
        }
      }

      const updatedComment = await Comment.findByIdAndUpdate(commentID, operation);
      res.json({
        message: 'Comment liked or unliked',
        comment: updatedComment
      });
    } catch (err) {
      res.status(500).json({
        message: 'An error occured while liking the comment',
        error: err.message
      });
    }
  },
  deleteComment: async (req, res) => {
    try {
      const deletedComment = await Comment.findByIdAndUpdate(
        req.params.id, 
        {isHidden: true}
      );

      if (!deletedComment) {
        res.status(404).json({
          message: 'This comment does not exist or has been deleted',
          error: err.message
        });
      }

      res.json({
        message: 'Comment successfully "deleted"',
        comment: deletedComment
      });
    } catch (err) {
      res.status(500).json({
        message: 'An error occured while deleting the comment',
        error: err.message
      });
    }
  },
};
