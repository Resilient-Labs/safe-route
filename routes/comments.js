const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

console.log('we made it to routes')

//Post Routes - simplified for now
<<<<<<< Updated upstream
router.post("/createComment/:id", commentsController.createComment);
=======
router.post("/createComment/:id", ensureAuth, commentsController.createComment);
>>>>>>> Stashed changes

router.put("/likeComment/:id", ensureAuth, commentsController.likeComment);

router.delete("/deleteComment/:id", ensureAuth, commentsController.deleteComment);

module.exports = router;
