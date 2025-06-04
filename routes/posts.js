const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/", postsController.getFeed);
router.post("/", ensureAuth, upload.single("file"), postsController.createPost);

router.get("/:id", postsController.getPostPage);

router.put("/:id/upvote", ensureAuth, postsController.upvotePost);

router.put("/:id/downvote", ensureAuth, postsController.downvotePost);

router.put("/:id/bookmark", ensureAuth, postsController.bookmarkPost);

router.delete("/:id", ensureAuth, postsController.deletePost);

module.exports = router;