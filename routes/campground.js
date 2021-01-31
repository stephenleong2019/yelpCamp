const express = require('express');
const multer = require('multer');

const { storage } = require('../cloudinary');
const catchAsync = require('../utils/catchAsync');
const { validateCampground } = require('../validations/campgrounds/campgroundValidation');
const {
  isLoggedIn,
  isAuthor,
} = require('../utils/authMiddleware');
const campgrounds = require('../controllers/campgrounds');

const router = express.Router();
const upload = multer({ storage });

//route
router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.createCampground));

router.route('/new')
  .get(isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .patch(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.route('/:id/edit')
  .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
