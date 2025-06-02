module.exports = {
  getResourcesPage: (req, res) => {
    res.render("resources.ejs", {
      title: "SafeRoute | Resources",
      currentPage: "resources",
      user: req.user,
    });
  },
};
