var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var index = require('./routes/index');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var Schema = require('./models/Schema.js');
var User = Schema.userModel;
var Survey = Schema.surveyModel;
var Response = Schema.responseModel;

require('dotenv').config({ silent: true });

var app = express();

var MONGOURI = process.env.MONGOURI;
var PORT = process.env.PORT || 3000;

mongoose.connect(MONGOURI, function (err) { if (err) {console.log(err);}});

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {},
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', index.home);

// Passport
passport.use(new LocalStrategy(User.authenticate()));

// serialize and deserialize
passport.serializeUser(function (user, done) {
    done(null, user._id);
  }
);
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (!err) done(null, user);
    else done(err, null);
  });
});

// URL Routing
app.get('/', index.home);
app.post('/api/survey/submit', index.submitSurvey);
app.post('/api/survey/new', index.newSurvey);
app.post('/api/newuser', index.newUser);
app.get('/api/getUser', index.getUser);
app.get('/api/getSurvey', index.getSurvey);
app.get('/api/getUsersSurveysResponses', index.getUsersSurveysResponses);

// Login for returning user
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { console.log("ERROR: ",err); return next(err); }
    if (!user) {
      console.log('no user');
      return res.json({ loggedIn:false });
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({ loggedIn:true, user:req.user });
    });
  })(req, res, next);
});

// Creation of a new user
app.post('/register', function (req, res) {
  User.register(
    new User({
      username: req.body.username,
      name: req.body.username,
      age: req.body.age,
      countryOfResidence: req.body.country,
      dateOfBirth: {
        year: req.body.DOB_year,
        month: req.body.DOB_month,
        day: req.body.DOB_day,
      },
    }),
    req.body.password,
    function (err, account) {
      if (err) {
        // Probably username already exists
        return res.json({success:false});
      }

      passport.authenticate('local')(req, res, function () {
        res.json({success:true});
      });
    }
  );
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('*', function (req, res) {
  res.sendFile('main.html', { root: path.join(__dirname, 'public') });
});

app.listen(PORT, function () {
  console.log('Application running on port:', PORT);
});
