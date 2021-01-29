const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { validateCampground } = require('../validations/campgrounds/campgroundValidation');
const {
  isLoggedIn,
  isAuthor,
} = require('../utils/authMiddleware');
const campgrounds = require('../controllers/campgrounds');

const router = express.Router();

//route
router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

router.route('/new')
  .get(isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .patch(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.route('/:id/edit')
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
