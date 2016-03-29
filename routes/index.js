var path = require('path');
var Schema = require('../models/Schema.js');
var User = Schema.userModel;
var Survey = Schema.surveyModel;
var Response = Schema.responseModel;
var routes = {};

routes.home = function (req, res) {
  // The following will be used to initially populate the survey collection
  // 	Survey.create({
  //   "author": "Mimi",
  //   "timeCreated": "Mon Mar 28 2016 19:17:11 GMT-0400 (EDT)",
  //   "questions": [{
  //       "id": 1,
  //       "type": "mc",
  //       "content": "How much do you like sharp cheddar?",
  //       "Answers": ["not at all", "it's not that bad", "I like it", "it's my favorite"],
  //     },
  //     {
  //       "id": 2,
  //       "type": "mc",
  //       "content": "How much do you like tart (unsweetened) yogurt?",
  //       "Answers": ["not at all", "it's not that bad", "I like it", "it's my favorite"],
  //     },
  //     {
  //       "id": 3,
  //       "type": "mc",
  //       "content": "How much do you like sour cream?",
  //       "Answers": ["not at all", "it's not that bad", "I like it", "it's my favorite"],
  //     },
  //     {
  //       "id": 4,
  //       "type": "mc",
  //       "content": "How much do you like goat cheese?",
  //       "Answers": ["not at all", "it's not that bad", "I like it", "it's my favorite"],
  //     },
  //   ],
  //   "usersTaken": [],
  // }, function(err, survey){
  // 	if (err){console.log(err)}else{console.log(survey.author)};
  // })

  res.sendFile('main.html', { root: path.join(__dirname, '../public') });
};

routes.getUser = function (req, res) {
  // Get request that needs to respond with a json containing logged-in
  // user and a survey object the user has not completed.
  Survey.find({ usersTaken: { $in: [req.user._id] } }, function (err, surveys) {
    // chooses a random survey to send to the user.
    randomIndex = Math.floor((Math.random() * surveys.length));
    res.json({ user: req.user, surveys:surveys[randomIndex] });
  });
};

routes.moreSurvey = function (req, res) {
  // Get request that needs with respond with a json containing another
  // survey object the user has not completed.
  Survey.find({ usersTaken: { $in: [req.user._id] } }, function (err, surveys) {
    // chooses a random survey to send to the user.
    randomIndex = Math.floor((Math.random() * surveys.length));
    res.json({ user: req.user, surveys:surveys[randomIndex] });
  });
};

routes.submitSurvey = function (req, res) {
  // Post request containing survey _id, response object, and user _id.
  // The response should be added to the response collection and the survey
  // should be added to the user object as a completed survey.
  // res contains response object.
  Survey.findOneandUpdate({ _id:req.body.survey._id }, { $push: { usersTaken: req.body.user._id },

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
