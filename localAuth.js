var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// var User = require('./models/userModel');

module.exports = passport.use(new LocalStrategy(User.authenticate()));
