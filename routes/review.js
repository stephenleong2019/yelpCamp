const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { validateReview } = require('../validations/reviews/reviewsValidation');
const {
  isLoggedIn,
  isReviewAuthor,
} = require('../utils/authMiddleware');
const reviews = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });//merge the params of default path in app.js

router.route('/:reviewID/edit')
  .get(
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviews.renderEditForm));

router.route('/')
  .post(isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.route('/:reviewID')
  .patch(
    isLoggedIn,
    isReviewAuthor,
    validateReview,
    catchAsync(reviews.updateReview))
  .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
