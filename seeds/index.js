const mongoose = require('mongoose');
const cities = require('./cities');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const {
  places,
  descriptors,
} = require('./seedHelpers');
const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 3000; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const geoData = await geocoder.forwardGeocode({
      query: `${cities[random1000].city}, ${cities[random1000].state}`,
      limit: 1,
    }).send();

    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: geoData.body.features[0].geometry,
      title: `${sample(descriptors)} ${sample(places)}`,
      price,
      author: '6012a8524c46ac58a21799e0',
      images: [{
        url: 'https://source.unsplash.com/collection/483251/photos',
        filename: 'test',
      }],
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A ducimus eum excepturi fugiat nulla quaerat quia? Assumenda at atque autem dolore exercitationem, incidunt molestiae recusandae temporibus! Accusantium nihil sed sunt.',
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
