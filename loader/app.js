//library
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

// custom class
const ExpressError = require('../utils/ExpressError');
const campgroundRoute = require('../routes/campground');
const reviewRoute = require('../routes/review');

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(flash());

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

app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:campgroundID/reviews', reviewRoute);

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




