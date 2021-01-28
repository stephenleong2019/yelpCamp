const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview } = require('../validations/reviews/reviewsValidation');

const router = express.Router({ mergeParams: true });//merge the params of default path in app.js

// middleware
router.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

router.get(
  '/:reviewID/edit',
  catchAsync(async (req, res, next) => {

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
router.post('/', validateReview, catchAsync(async (req, res) => {

  const { campgroundID } = req.params;
  const campground = await Campground.findById(campgroundID);

  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();

  req.flash('success', 'Review is added');

  res.redirect(`/campgrounds/${campgroundID}`);
}));


router.patch(
  '/:reviewID',
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

    req.flash('success', 'Review is Updated');

    res.redirect(`/campgrounds/${campgroundID}`);
  }));


router.delete('/:reviewID', catchAsync(async (req, res, next) => {

  const {
    campgroundID,
    reviewID,
  } = req.params;

  await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } });

  await Review.findByIdAndDelete(reviewID);

  req.flash('success', 'Review is deleted');

  res.redirect(`/campgrounds/${campgroundID}`);
}));

module.exports = router;
