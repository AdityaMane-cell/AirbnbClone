if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// imports
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session"); //express-session's storage feature can leak data
const MongoStore = require("connect-mongo"); // used for session
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratery = require("passport-local");
const User = require("./models/user.js");

// router
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// utilities
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// connnecting to mongo DB - Airbnb
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("connected to DB......");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

// connect-mongo's session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 60 * 60, //24hrs
});

store.on("error", () => {
  console.log("error inside mongo session store", err);
});

// session
const sessionOptions = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// always comes before routes
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //enables webapp to identify user as they browse from page to page. This series of req & res, each associated with same user is know as session
passport.use(new LocalStratery(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  // res.locals.redirectUrl = req.session.redirectUrl || null; // global middleware to pass redirect url
  res.locals.currUser = req.user; // to be able to access currUser in every route
  res.locals.mapToken = process.env.MAP_API_KEY; // pass map DEFAULT KEY to every route
  next();
});

// routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//for any random route which is not specified above
// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not Found"));
// });

app.use((err, req, res, next) => {
  console.log("inside error");
  let { statusCode = 500, message = "Something Went Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Listening on port 8080...");
});
