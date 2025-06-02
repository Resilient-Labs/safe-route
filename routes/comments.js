const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

console.log('we made it to routes')

//Post Routes - simplified for now
router.post("/createComment/:id", ensureAuth, commentsController.createComment);

router.put("/likeComment/:id", ensureAuth, commentsController.likeComment);

router.delete("/deleteComment/:id", ensureAuth, commentsController.deleteComment);

module.exports = router;
