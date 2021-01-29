const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.renderEditForm = async (req, res, next) => {

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
};

module.exports.createReview = async (req, res) => {

  const { campgroundID } = req.params;
  const campground = await Campground.findById(campgroundID);

  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();

  req.flash('success', 'Review is added');

  res.redirect(`/campgrounds/${campgroundID}`);
};

module.exports.updateReview = async (req, res, next) => {

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
}

module.exports.deleteReview = async (req, res, next) => {

  const {
    campgroundID,
    reviewID,
  } = req.params;

  await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } });

  await Review.findByIdAndDelete(reviewID);

  req.flash('success', 'Review is deleted');

  res.redirect(`/campgrounds/${campgroundID}`);
}
