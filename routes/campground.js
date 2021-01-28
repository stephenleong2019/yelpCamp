const express = require('express');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { validateCampground } = require('../validations/campgrounds/campgroundValidation');

const router = express.Router();

// middleware
router.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

//route
router.get('/', catchAsync(async (req, res, next) => {

  const campgrounds = await Campground.find({});

  res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res, next) => {

  res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id).populate('reviews');

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

router.get('/:id/edit', catchAsync(async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  res.render('campgrounds/edit', { campground });
}));

router.post('/', validateCampground, catchAsync(async (req, res, next) => {

  const campground = new Campground(req.body.campground);
  await campground.save();

  req.flash('success', 'Campground is added');

  res.redirect(`/campgrounds/${campground._id}`);
}));

router.patch('/:id', validateCampground, catchAsync(async (req, res, next) => {

  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true });

  req.flash('success', 'Campground is updated');

  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', catchAsync(async (req, res, next) => {

  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  req.flash('success', 'Campground is deleted');

  res.redirect('/campgrounds');
}));

module.exports = router;
