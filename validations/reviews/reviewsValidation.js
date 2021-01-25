const { reviewsSchema } = require('./reviewsSchema');
const ExpressError = require('../../utils/ExpressError');

module.exports.validateReview = (req, res, next) => {

  const { error } = reviewsSchema.validate(req.body);

  if (error) {
    const message = error.details.map(detail => detail.message).join(',');

    throw new ExpressError(400, message);
  } else {

    next();
  }
};
