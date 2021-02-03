const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const countryList = require('country-list');

const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {

  const campgrounds = await Campground.find({});

  res.render('campgrounds/index', { campgrounds });
};


module.exports.renderNewForm = async (req, res) => {

  const countries = await countryList.getNames();

  res.render('campgrounds/new', { countries });
};

module.exports.createCampground = async (req, res) => {

  const { location } = req.body.campground;

  const geoData = await geocoder.forwardGeocode({
    query: location,
    limit: 1,
  }).send();

  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
  }));
  campground.author = req.user._id;
  await campground.save();

  req.flash('success', 'Campground is added');

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res, next) => {

  const { id } = req.params;

  const campground = await Campground.findById(id).populate({
    path: 'reviews',
    populate: {
      path: 'author',
    },
  }).populate('author');

  if (!campground) {

    req.flash('error', 'Cannot find the campground');
    return res.redirect('/campgrounds');
  }

  res.render(
    'campgrounds/show',
    {
      campground,
      editMode: false,
    });
};

module.exports.renderEditForm = async (req, res) => {

  const { id } = req.params;

  const campground = await Campground.findById(id);

  const countries = await countryList.getNames();

  res.render('campgrounds/edit', { campground,  countries});
};

module.exports.updateCampground = async (req, res) => {

  const { id } = req.params;

  const { location } = req.body.campground;

  const geoData = await geocoder.forwardGeocode({
    query: location,
    limit: 1,
  }).send();

  req.body.campground.geometry = geoData.body.features[0].geometry;

  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true });

  const images = req.files.map(file => ({
    url: file.path,
    filename: file.filename,
  }));

  campground.images.push(...images);
  await campground.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // pull images from array
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
  }


  req.flash('success', 'Campground is updated');

  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {

  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  req.flash('success', 'Campground is deleted');

  res.redirect('/campgrounds');
};
