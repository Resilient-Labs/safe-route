const LocalStrategy = require("passport-local").Strategy;
const mongoose      = require("mongoose");
const { promisify } = require("util");
const User          = require("../models/User");

module.exports = function (passport) {
  // ───────────────────────────────────
  // Local strategy
  // ───────────────────────────────────
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        /* 1. Look up the user (promises only) */
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }
        if (!user.password) {
          return done(null, false, {
            msg:
              "Your account was registered using a sign-in provider. " +
              "To enable password login, sign in with that provider first, " +
              "then set a password in your profile.",
          });
        }

        /* 2. Compare passwords (wrap the callback helper in a promise) */
        const compare = promisify(user.comparePassword.bind(user));
        const isMatch = await compare(password);

        if (!isMatch) {
          return done(null, false, { msg: "Invalid email or password." });
        }

        /* 3. Success */
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // ───────────────────────────────────
  // Sessions
  // ───────────────────────────────────
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      /* findById is promise-based in Mongoose 7 */
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
