const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CamgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Campground', CamgroundSchema);
