//library
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// custom class
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const campgroundRoutes = require('../routes/campground');
const reviewRoutes = require('../routes/review');
const userRoutes = require('../routes/user');

const app = express();

mongoose.connect(
  'mongodb://localhost:27017/yelp-camp',
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database connection open');
  })
  .catch(err => {
    console.log('Cannot connect database');
    console.log(err);
  });


app.listen(8080, () => {

  console.log('Server Start, port 8080');
});

// set ejs as view engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
// let route accept json format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// override some post route to patch, delete, put or etc
app.use(methodOverride('_method'));
// set public folder, then the template can get the stuff in public by default
app.use(express.static(path.join(__dirname, '../public')));
// use flash
app.use(flash());
// local session setup
const sessionConfig = {
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
// setup passport, set passport session config after local session config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user;
  next();
});
// setup route
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:campgroundID/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {

  res.render('home/home');
});

//order is matter, follow the order
app.all('*', (req, res, next) => {

  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  const {
    statusCode = 500,
    message = 'Unexpected error',
  } = err;

  res.status(statusCode);
  res.render(
    'error/error',
    {
      statusCode,
      message,
    });
});




