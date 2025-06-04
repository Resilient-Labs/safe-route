const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home.js");
const postsController = require("../controllers/posts");
const mapController = require("../controllers/map");
const resourceController = require("../controllers/resource");
const { ensureAuth } = require("../middleware/auth");


router.get("/", homeController.getLandingPage);

router.get("/signin", authController.getSigninPage);
router.post("/signin", authController.postSignin);
router.get("/signup", authController.getSignupPage);
router.post("/signup", authController.postSignup);
router.get("/signout", authController.getSignout);

router.get("/feed", postsController.getFeedPage);
router.get("/map", mapController.getMapPage); 
router.get("/resources", resourceController.getResourcesPage);


module.exports = router;
