var path = require('path');

var Schema = require('../models/Schema.js');
var User = Schema.userModel;
var Survey = Schema.surveyModel;
var Response = Schema.responseModel;

var routes = {};

routes.home = function (req, res) {
  res.sendFile('main.html', { root: path.join(__dirname, '../public') });
};

routes.getUser = function (req, res) {
  // Get request that needs to respond with a json containing logged-in
  // user and a survey object the user has not completed.
  User.find({}, function (err, users) {
    loggedInUser = {};
    users.forEach(function (element, index, array) {
      console.log(element.username, element.loggedin);
      if (element.loggedin) {
        loggedInUser = element;
        console.log(loggedInUser);
      }
    });

    Survey.find({ usersTaken: { $in: [loggedInUser._id] } }, function (err, surveys) {
      // chooses a random survey to send to the user.
      randomIndex = Math.floor((Math.random() * surveys.length));
      res.json({ user: loggedInUser, surveys:surveys[randomIndex] });
    });
  });
};

routes.moreSurvey = function (req, res) {
  // Get request that needs with respond with a json containing another
  // survey object the user has not completed.
  User.find({}, function (err, users) {
    users.forEach(function (element, index, array) {
          console.log(element.username, element.loggedin);
          if (element.loggedin) {
            loggedInUser = element.username;
            console.log(loggedInUser);
          }
        });

    Survey.find({ usersTaken: { $in: [loggedInUser] } }, function (err, surveys) {
      // chooses a random survey to send to the user.
      randomIndex = Math.floor((Math.random() * surveys.length));
      res.json({ user: loggedInUser, surveys:surveys[randomIndex] });
    });
  });
};

routes.submitSurvey = function (req, res) {
  // Post request containing survey _id, response object, and user _id.
  // The response should be added to the response collection and the survey
  // should be added to the user object as a completed survey.
  // res contains response object.
  // User.findOneandUpdate({_id:req.});
};

routes.newSurvey = function (req, res) {
  // Post request containing a user object to be added to the user collection.
};

routes.newUser = function (req, res) {
  // Needs to respond with a json containing logged-in user and several
  // survey schemas.
};

module.exports = routes;
