const { Post } = require('../models/Post');

module.exports = {
  getMap: (req, res) => {
    try {
      const posts = Post.find({
        isHidden: false,
        isResolved: false,
      }).lean();
      res.render("mapView.ejs", { user: req.user, posts });
    } catch (err) {
      console.log('Unable to fetch posts', err);
      res.redirect('/');
    }
  },
};
