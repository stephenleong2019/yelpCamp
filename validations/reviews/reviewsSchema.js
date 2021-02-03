const Joi = require('../htmlPrevention');

module.exports.reviewsSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(0).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});



