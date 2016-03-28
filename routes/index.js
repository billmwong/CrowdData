var path = require('path');

var routes = {};

routes.home = function (req, res) {
  // Get request that needs to respond with a json containing logged-in
  // user and several survey objects the user has not completed.
};

routes.moreSurveys = function (req, res) {
  // Get request that needs with respond with a json containing several
  // survey objects the user has not completed.
};

routes.submitSurvey = function (req, res) {
  // Post request containing survey _id, response object, and user _id.
  // The response should be added to the response collection and the survey
  // should be added to the ouser object as a completed survey.
  // res contains response object.
};

routes.newSurvey = function (req, res) {
  // Post request containing a user object to be added to the user collection.
};

routes.newUser = function (req, res) {
  // Needs to respond with a json containing logged-in user and several
  // survey schemas.
};

module.exports = routes;
