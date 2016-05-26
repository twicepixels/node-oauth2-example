// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// var ejs = require('ejs');
var passport = require('passport');
var session = require('express-session');
var auth = require('./controllers/auth');
var user = require('./controllers/user');
var beer = require('./controllers/beer');
var client = require('./controllers/client');
var oauth2 = require('./controllers/oauth2');

// Connect to the beerlocker MongoDB
mongoose.connect('mongodb://localhost:27017/beerlocker');

// Create our Express application
var app = express();

// Set view engine to ejs
// app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Use express session support since OAuth2orize requires it
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'Super Secret Session Key'
}));

// Use the passport package in our application
app.use(passport.initialize());

// Create our Express router
var router = express.Router();

// Create endpoint handlers for /beers
router.route('/api/beers')
    .post(auth.isAuth, beer.postBeers)
    .get(auth.isAuth, beer.getBeers);

// Create endpoint handlers for /beers/:beer_id
router.route('/api/beers/:beer_id')
    .get(auth.isAuth, beer.getBeer)
    .put(auth.isAuth, beer.putBeer)
    .delete(auth.isAuth, beer.deleteBeer);

// Create endpoint handlers for /users
router.route('/api/users')
    .post(user.postUsers)
    .get(auth.isAuth, user.getUsers);

// Create endpoint handlers for /clients
router.route('/api/clients')
    .post(auth.isAuth, client.postClients)
    .get(auth.isAuth, client.getClients);

// Create endpoint handlers for oauth2 authorize
router.route('/api/oauth2/authorize')
    .post(oauth2.decision)
    .get(oauth2.authorization);
// Create endpoint handlers for oauth2 token
router.route('/api/oauth2/token')
    .post(oauth2.token);
// Register all our routes
app.use(router);
// Start the server
app.listen(3000);