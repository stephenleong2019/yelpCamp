const mongoose = require('mongoose');
const cities = require('./cities');
const {
  places,
  descriptors,
} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      price,
      author: '601298cc7445aa53c50872d0',
      images: [{
        url: 'https://source.unsplash.com/collection/483251',
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
