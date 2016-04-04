var path = require('path');
var Schema = require('../models/Schema.js');
var User = Schema.userModel;
var Survey = Schema.surveyModel;
var Response = Schema.responseModel;
var routes = {};

routes.home = function (req, res) {
  res.sendFile('main.html', { root: path.join(__dirname, '../public') });
};

routes.getUser = function(req, res){
  console.log(req.user);
  res.json({user: req.user, msg:'here is your user'});
};

routes.getSurvey = function (req, res) {
  // Get request that needs to respond with a json containing logged-in
  // user and a survey object the user has not completed.
  console.log('req.user:');
  console.log(req.user);
  Survey.find({ usersTaken: { $nin: [req.user._id] } }, function (err, surveys) {
    // chooses a random survey to send to the user.
    randomIndex = Math.floor((Math.random() * surveys.length));
    res.json({ user: req.user, survey:surveys[randomIndex] });
  });
};

routes.submitSurvey = function (req, res) {
  // Post request containing survey _id, response object, and user _id.
  // The response should be added to the response collection and the survey
  // should be added to the user object as a completed survey.
  // res contains response object.
  console.log("what is survey response data? :");
  console.log(req.body.response.data);
  Survey.findOneAndUpdate({ _id:req.body.survey_id}, { $push: { usersTaken: req.body.user_id },

  });
  Response.create(req.body.response, function (err, response) {
    res.json(response);
  });
};

routes.newSurvey = function (req, res) {
  // Post request containing a survey object to be added to the survey collection.
  Survey.create(req.body.survey, function (err, survey) {
    res.json(survey);
  });
};

routes.newUser = function (req, res) {
  // Post request containing a user object to be added to the user collection.
  User.create(req.body.response, function (err, user) {
    res.json(user);
  });
};

module.exports = routes;
