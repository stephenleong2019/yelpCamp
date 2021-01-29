const express = require('express');
const passport = require('passport');

const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

const router = express.Router();

router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.route('/login')
  .get(users.renderLoginForm)
  .post(
    passport.authenticate(
      'local',
      {
        failureFlash: true,
        failureRedirect: '/login',
      }),
    users.login,
  );

router.route('/logout')
  .get(users.logout);

module.exports = router;
