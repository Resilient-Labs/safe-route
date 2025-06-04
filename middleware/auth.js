module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("errors", { msg: "You must sign in first" });
      res.redirect("/signin");
    }
  }
};
