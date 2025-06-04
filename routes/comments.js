const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

console.log('we made it to routes')

//Post Routes - simplified for now
router.post("/:id", ensureAuth, commentsController.createComment);

router.put("/:id/like", ensureAuth, commentsController.likeComment);

router.delete("/:id", ensureAuth, commentsController.deleteComment);

module.exports = router;
