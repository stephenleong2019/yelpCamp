const mongoose = require('mongoose');
const Review = require('./review');
const { ImageSchema } = require('./image');
const Schema = mongoose.Schema;

// let json include virtual
const opts = { toJSON: { virtuals: true } };

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
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  images: [ImageSchema],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
}, opts);

CampgroundSchema.virtual('properties.popUpMarkUp').get(function () {

  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
});


CampgroundSchema.post('findOneAndDelete', async (campground) => {

  if (campground.reviews.length) {
    const res = await Review.deleteMany({ _id: { $in: campground.reviews } });
  }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
