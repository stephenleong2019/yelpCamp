const User = require('../models/user')


module.exports.renderRegister = (req, res) => {

  res.render('users/register');
}

module.exports.register = async (req, res, next) => {

  try {

    const {
      email,
      username,
      password,
    } = req.body.user;
    const user = new User({
      email,
      username,
    });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) {
        req.flash('error', 'please login');
        return next(err);
      }

      req.flash('success', 'Welcome to Yelp Camp');
      res.redirect('/campgrounds');
    });
  } catch (err) {

    req.flash('error', err.message);
    res.redirect('/register');
  }
}

module.exports.login = (req, res) => {

  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;

  req.flash('success', 'welcome back');
  res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye!');

  res.redirect('/campgrounds');
}

module.exports.renderLoginForm = (req, res) => {

  res.render('users/login');
}
