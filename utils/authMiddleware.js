const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'please login');
    return res.redirect('/login');
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  if (!campground.author.equals(req.user._id)) {

    req.flash('error', 'You do not have permission to update');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};


module.exports.isReviewAuthor = async (req, res, next) => {

  const { campgroundID, reviewID } = req.params;

  const review = await Review.findById(reviewID).populate('user');

  if (!review.author.equals(req.user._id)) {

    req.flash('error', 'You do not have permission to update the review');
    return res.redirect(`/campgrounds/${campgroundID}`);
  }
  next();
};


