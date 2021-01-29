const express = require('express');
const passport = require('passport');

const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');


const router = express.Router();

router.get('/register', (req, res) => {

  res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {

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


}));

router.get('/login', (req, res) => {

  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate(
    'local',
    {
      failureFlash: true,
      failureRedirect: '/login',
    }),
  (req, res) => {

    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;

    req.flash('success', 'welcome back');
    res.redirect(redirectUrl);
  });

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye!');

  res.redirect('/campgrounds');
});

module.exports = router;
