const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

CampgroundSchema.post('findOneAndDelete', async (campground) => {

  if (campground.reviews.length) {
    const res = await Review.deleteMany({ _id: { $in: campground.reviews } });
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
