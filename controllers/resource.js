module.exports = {
    getResources: (req, res) => {
      res.render("resources.ejs", {
      title: "SafeRoute | Resources",
      currentPage: "resources",
      user: req.user,
    });
    },
  };