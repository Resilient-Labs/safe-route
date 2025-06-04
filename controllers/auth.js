const passport = require("passport");
const validator = require("validator");
const NodeGeocoder = require('node-geocoder');
const { User } = require("../models/User");

exports.getSigninPage = (req, res) => {
  if (req.user) {
    return res.redirect("/map");
  };
  res.render("signin.ejs", {
    title: "SafeRoute | Signin",
    currentPage: "signin",
    user: req.user,
  });
};

exports.postSignin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/signin");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/signin");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/map");
    });
  })(req, res, next);
};

exports.getSignout = async (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) console.log(err);
      req.user = null;
      res.redirect("/");
    });
  });
};

exports.getSignupPage = (req, res) => {
  if (req.user) {
    return res.redirect("/map");
  }
  res.render("signup.ejs", {
    title: "SafeRoute | Signup",
    currentPage: "signup",
    user: req.user,
  });
};

exports.postSignup = async (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.firstName))
    validationErrors.push({ msg: "First name cannot be blank." });
  if (validator.isEmpty(req.body.lastName))
    validationErrors.push({ msg: "Last name cannot be blank." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  try {
    const existingUser = await User.findOne(
      { email: req.body.email });
    if (existingUser) {
      req.flash("errors", {
        msg: "Account with that email address already exists.",
      });
      return res.redirect("../signup");
    }

    const geocoder = NodeGeocoder({ provider: 'openstreetmap' });
    const geoResults = await geocoder.geocode({ postalcode: req.body.zipCode, country: 'US' });

    let coordinates = undefined;
    if (geoResults && geoResults.length > 0) {
      const { latitude, longitude } = geoResults[0];
      coordinates = [longitude, latitude];
    }


    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      zipCode: req.body.zipCode,
      location: coordinates
        ? {
          type: 'Point',
          coordinates
        }
        : undefined,
    });

    await user.save();

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/map");
    });

  } catch (err) {
    return next(err);
  }
};
