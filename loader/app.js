if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo')(session);

// custom class
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const campgroundRoutes = require('../routes/campground');
const reviewRoutes = require('../routes/review');
const userRoutes = require('../routes/user');


const app = express();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(
  dbUrl,
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

const secret = process.env.SECRET || 'yelpCampSecret';

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,// delay the time to store the session in database
});

store.on('error', function (e) {
  console.log('Session store error', e);
});

const sessionConfig = {
  store,
  name: 'yelp-camp',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
// setup passport, set passport session config after local session config
app.use(passport.initialize());
app.use(passport.session());
//avoid mongodb injection, aim: replace mongodb keyword or key sign
app.use(mongoSanitize({
  replaceWith: '_',
}));
// help to save various http header attack
app.use(helmet());

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ['\'self\'', ...connectSrcUrls],
      scriptSrc: ['\'unsafe-inline\'', '\'self\'', ...scriptSrcUrls],
      styleSrc: ['\'self\'', '\'unsafe-inline\'', ...styleSrcUrls],
      workerSrc: ['\'self\'', 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        '\'self\'',
        'blob:',
        'data:',
        'https://res.cloudinary.com/stephenitwork2019/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        'https://images.unsplash.com',
        'https://source.unsplash.com',
        'https://miro.medium.com/max/2400/1*hFwwQAW45673VGKrMPE2qQ.png',
      ],
      fontSrc: ['\'self\'', ...fontSrcUrls],
    },
  }),
);


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
      err,
    });
});




