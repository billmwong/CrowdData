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

//////////////// PASSPORT STUFF ////////////////

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

app.get('/', index.home); // homepage needing logged-in user and initial batch of surveys
app.post('/api/survey/submit', index.submitSurvey); // new survey response needing to be added to db.
app.post('/api/survey/new', index.newSurvey); // new survey object needing to be added to db.
app.post('/api/newuser', index.newUser); // new user details needing to be added to db.
app.get('/api/getUser', index.getUser); //see who's logged in
app.get('/api/getSurvey', index.getSurvey); //get a survey the user hasn't taken

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  }
);

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
        return res.status(500).send(err.message);
      }

      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
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

// module.exports = app;
