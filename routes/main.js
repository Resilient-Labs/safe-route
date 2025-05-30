const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const mapController = require("../controllers/map");
const resourceController = require("../controllers/resource");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/signin", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/feed", postsController.getFeed);
router.get("/mapView", mapController.getMap); 
router.get("/resources", resourceController.getResources) 


router.get("/profile", ensureAuth, postsController.getProfile);

router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);


router.post("/signup", authController.postSignup);

module.exports = router;