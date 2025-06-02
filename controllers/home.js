module.exports = {
  getIndex: (req, res) => {
    res.status(200).render("landing.ejs", {
      title: "SafeRoute | Home",
      currentPage: "home",
      user: req.user,
    });
  },
};
