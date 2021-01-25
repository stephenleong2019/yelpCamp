const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('../models/campground');
const Review = require('../models/review');
const methodOverride = require('method-override');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const { validateCampground } = require('../validations/campgrounds/campgroundValidation');
const { validateReview } = require('../validations/reviews/reviewsValidation');

mongoose.connect(
  'mongodb://localhost:27017/yelp-camp',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

app.get('/', (req, res) => {

  res.render('home/home');
});

app.get('/campgrounds', catchAsync(async (req, res, next) => {

  const campgrounds = await Campground.find({});

  res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res, next) => {

  res.render('campgrounds/new');
});

app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id).populate('reviews');

  res.render(
    'campgrounds/show',
    {
      campground,
      editMode: false,
    });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  res.render('campgrounds/edit', { campground });
}));

app.get('/campgrounds/:campgroundID/reviews/:reviewID/edit', catchAsync(async (req, res, next) => {

  const {
    campgroundID,
    reviewID,
  } = req.params;

  const campground = await Campground.findById(campgroundID).populate('reviews');

  res.render(
    'campgrounds/show',
    {
      campground,
      editMode: true,
      reviewID,
    });
}));

//                            err handle call back
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {

  const campground = new Campground(req.body.campground);
  await campground.save();

  res.redirect(`/campgrounds/${campground._id}`);
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {

  const { id } = req.params;
  const campground = await Campground.findById(id);

  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();

  res.redirect(`/campgrounds/${id}`);
}));


app.patch('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {

  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true });

  res.redirect(`/campgrounds/${campground._id}`);
}));

app.patch(
  '/campgrounds/:campgroundID/reviews/:reviewID',
  validateReview,
  catchAsync(async (req, res, next) => {

    const {
      campgroundID,
      reviewID,
    } = req.params;

    const {
      body,
      rating,
    } = req.body.review;

    await Review.findByIdAndUpdate(
      reviewID,
      {
        body,
        rating,
      },
      { new: true });

    res.redirect(`/campgrounds/${campgroundID}`);
  }));


app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {

  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  res.redirect('/campgrounds');
}));

app.delete('/campgrounds/:campgroundID/reviews/:reviewID', catchAsync(async (req, res, next) => {

  const {
    campgroundID,
    reviewID,
  } = req.params;

  await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } });

  await Review.findByIdAndDelete(reviewID);

  res.redirect(`/campgrounds/${campgroundID}`);
}));

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




