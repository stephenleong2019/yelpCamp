const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: {
    type: String,
  },
  filename: {
    type: String,
  },
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200,h_200');
});

const image = mongoose.model('Image', ImageSchema);

module.exports = {
  ImageSchema,
  image,
};
