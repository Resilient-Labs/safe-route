module.exports = {
    getResources: (req, res) => {
      res.render("resources.ejs", {
      Title: "SafeRoute | Resources",
      currentPage: "resources",
      user: req.user,
    });
    },
  };