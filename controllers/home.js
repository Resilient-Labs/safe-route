module.exports = {
  getLanding: (req, res) => {
    res.status(200).render("landing.ejs");
  },
};
