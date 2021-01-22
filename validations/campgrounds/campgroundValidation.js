const { campgroundSchema } = require('./campgroundsSchema');
const ExpressError = require('../../utils/ExpressError');

module.exports.validateCampground = (req, res, next) => {

  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const message = error.details.map(detail => detail.message).join(',');

    throw new ExpressError(400, message);
  } else {

    next();
  }
};
