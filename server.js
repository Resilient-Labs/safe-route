const express        = require("express");
const app            = express();
const mongoose       = require("mongoose");
const passport       = require("passport");
const session        = require("express-session");
const MongoStore     = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash          = require("express-flash");
const logger         = require("morgan");
const connectDB      = require("./config/database");
const mainRoutes     = require("./routes/main");
const postRoutes     = require("./routes/posts");
const commentRoutes  = require("./routes/comments");


require("dotenv").config({ path: "./config/.env" });
require("./config/passport")(passport);

connectDB();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger("dev"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//could use this for every view page / DRY. DON'T DELETE!  Will test when front end functionality is completed./ able to test a user requirment.
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// }); 

app.use("/", mainRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});
