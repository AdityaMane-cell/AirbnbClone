const User = require("../models/user.js");

// render signup
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// signup
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// render login
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// login
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust. You're logged in!");

  // console.log("login : res.local.redirect", res.locals.redirectUrl);
  let redirectUrl = res.locals.redirectUrl;
  // console.log("login : req.session.redirect: ", req.session.redirectUrl);
  delete req.session.redirectUrl;

  res.redirect(redirectUrl);
};

// logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You're logged out now!");
    res.redirect("/listings");
  });
};
