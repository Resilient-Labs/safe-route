const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments");
const { ensureAuth } = require("../middleware/auth");


router.post("/:id", ensureAuth, commentsController.createComment);
router.put("/:id/like", ensureAuth, commentsController.likeComment);
router.delete("/:id", ensureAuth, commentsController.deleteComment);


module.exports = router;
