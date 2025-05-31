const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getPost);

router.post("/newPost", upload.single("file"), postsController.createPost);

router.put("/:id/upvote", ensureAuth, postsController.upvotePost);

router.put("/:id/downvote", ensureAuth, postsController.downvotePost);

router.delete("/:id/bookmark", postsController.bookmarkPost);

router.delete("/:id/deletePost", postsController.deletePost);


module.exports = router;
