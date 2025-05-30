module.exports = {
  getIndex: (req, res) => {
    res.status(200).render("landing.ejs");
  },
};
