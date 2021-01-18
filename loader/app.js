const express = require('express');
const app = express();
const path = require('path');

app.listen(8080, () => {

    console.log('Server Start, port 8080');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname), '../views');

app.get('/', (req, res) =>{

    res.send('HELLO FORM YELP CAMP');
})
