const { Post } = require('../models/Post');

module.exports = {
  getMapPage: (req, res) => {
    try {
      const posts = Post.find({
        isHidden: false,
        isResolved: false,
      });
      res.render("mapView.ejs", {
        title: "SafeRoute | Map",
        currentPage: "map",
        user: req.user,
        posts
      });
    } catch (err) {
      console.log("Unable to fetch posts or render page", err);
      req.flash("errors", {
        msg: "Unable to fetch posts or view page.",
      });
      res.redirect('/');
    }
  },
};

