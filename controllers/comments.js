const Comment = require("../models/Comment");

module.exports = {
  createComment: async (req, res) => {
    try {
      //TODO: Make it compatible with x-form as well as json (was already set to handle x-form and json)
      await Comment.create({
        commentText: req.body.comment,
        likes: 0,
        user: req.user.id,
        post: req.params.id
      });
      console.log("Comment has been added!");
      res.redirect("/post/" + req.params.id);
    } catch (err) {
      res.status(500).json({message:"Failed to create comment", error: err.message})
    }
  },
  likeComment: async (req, res) => {
    //TODO: Make sure to avoid duplicated likes and impplement toggle functionality    
    
    try {
      const commentID = req.params.id
      const userID = req.user.id

      const comment = await Comment.findById(commentID);
      if(!comment){
        res.status(404).send("Comment Not Found")
      }
      // Check to make sure that the comment has been liked by the current user
      const userHasLike = comment.likeBy.includes(userID)

      let operation;
      if(userHasLike){
        operation ={
          $inc: {likes: -1},
          $pull: {likeBy: userID}
        }

        console.log("Likes -1 (User unlinked)")
      }
      else{
        operation = {
          $inc: {likes: 1},
          $push: {likeBy: userID}
        }

        Console.log("Likes +1 (User linked)")
      }

      await Comment.findByIdAndUpdate(commentID, operation)
      // To redirec back
      res.redirect('back')

    } catch (err) {
      console.log(err);
    }
  },
  deleteComment: async (req, res) => {
    try {
      //TODO: Make sure it works 
      const deleteComment = await Comment.findByIdAndDelete(req.params.id );

      if(!deleteComment){
        console.log("Comment not found for deletion:", req.params.id)
        return res.redirect('back')
      }

      console.log("Deleted Comment");
      res.redirect("back");

    } catch (err) {
      res.status(500).json({message: "Delelation was not succesful", error: err.message})
      res.redirect("back");
    }
  },
};
