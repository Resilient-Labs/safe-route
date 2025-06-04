module.exports = {
  getLandingPage: (req, res) => {
    res.render("landing.ejs", {
      title: "SafeRoute | Home",
      currentPage: "home",
      user: req.user,
    });
  },
};
