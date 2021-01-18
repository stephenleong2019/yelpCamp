const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Database connection open');
    })
    .catch(err => {
        console.log('Cannot connect database');
        console.log(err);
    })


app.listen(8080, () => {

    console.log('Server Start, port 8080');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {

    res.render('home/home');
});

app.post('/campground', (req, res) => {

    const camp = new Campground(req.body);

    camp.save();

    res.send(camp);
})
