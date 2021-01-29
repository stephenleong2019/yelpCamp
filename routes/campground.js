const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { validateCampground } = require('../validations/campgrounds/campgroundValidation');
const {
  isLoggedIn,
  isAuthor,
} = require('../utils/authMiddleware');

const router = express.Router();

//route
router.get('/', catchAsync(async (req, res) => {

  const campgrounds = await Campground.find({});

  res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {

  res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author',
    },
  }).populate('author');

  if (!campground) {

    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds');
  }

  res.render(
    'campgrounds/show',
    {
      campground,
      editMode: false,
    });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  res.render('campgrounds/edit', { campground });
}));

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {

  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();

  req.flash('success', 'Campground is added');

  res.redirect(`/campgrounds/${campground._id}`);
}));

router.patch(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      { new: true });

    req.flash('success', 'Campground is updated');

    res.redirect(`/campgrounds/${campground._id}`);
  }));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {

  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  req.flash('success', 'Campground is deleted');

  res.redirect('/campgrounds');
}));

module.exports = router;
