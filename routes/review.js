const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview } = require('../validations/reviews/reviewsValidation');
const {
  isLoggedIn,
  isReviewAuthor,
} = require('../utils/authMiddleware');

const router = express.Router({ mergeParams: true });//merge the params of default path in app.js

router.get(
  '/:reviewID/edit',
  isLoggedIn,
  isReviewAuthor,
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
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {

  const { campgroundID } = req.params;
  const campground = await Campground.findById(campgroundID);

  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();

  req.flash('success', 'Review is added');

  res.redirect(`/campgrounds/${campgroundID}`);
}));


router.patch(
  '/:reviewID',
  isLoggedIn,
  isReviewAuthor,
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


router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(async (req, res, next) => {

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
