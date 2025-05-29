const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

 console.log('we made it to routes')

//Post Routes - simplified for now
router.post("/createComment/:rainbowUnicorn", commentsController.createComment);

router.put("/likeComment/:id", commentsController.likeComment);

router.delete("/deleteComment/:id", commentsController.deleteComment);

module.exports = router;
