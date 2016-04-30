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
  res.json({ user: req.user, msg:'here is your user' });
};

// Get a survey that the user has not taken yet.
routes.getSurvey = function (req, res) {
  Survey.find({ usersTaken: { $nin: [req.user._id] } }, function (err, surveys) {
    // chooses a random survey to send to the user.
    randomIndex = Math.floor((Math.random() * surveys.length));
    res.json({ user: req.user, survey:surveys[randomIndex] });
  });
};

var handleResponses = function (res, err, responses) {
  res.json({success:true});
};

// Gets all the responses for all the surveys that this user has created.
routes.getUsersSurveysResponses = function (req, res) {
  // Find all the surveys that this user has created
  Survey.find({author:req.user._id}, function (err, thisUsersSurveys) {
    // Find the responses for each survey
    var surveyIds = thisUsersSurveys.map(function (survey){
      return survey._id;
    });
    console.log(surveyIds);

    Response.find({survey:{$in:surveyIds}}, function(err, responses){
      console.log('got all reponses: '+JSON.stringify(responses));
      res.json({
        thisUsersSurveys: thisUsersSurveys,
        responses: responses
      });
    });
  });
};

// Post request containing survey _id, response object, and user _id to update the database.
routes.submitSurvey = function (req, res) {
  Survey.findOneAndUpdate({ _id:req.body.survey_id }, { $push: { 'usersTaken': req.body.user_id }}, function(err, survey){
    if (err){
      console.log(err);
      res.status(500);
    } else{
        User.findOneAndUpdate({_id:req.body.user_id}, { $push: {'surveysTaken': req.body.survey_id }}, function(err, user){
          if (err){
            console.log(err);
            res.status(500);
          }
        }
      );
    }
  });
  Response.create(req.body.response, function (err, response) {
    res.json(response);
  });
};

// Post request containing a survey object to be added to the survey collection.
routes.newSurvey = function (req, res) {
  Survey.create(req.body, function (err, survey) {
    res.json(survey);
  });
};

// Post request containing a user object to be added to the user collection.
routes.newUser = function (req, res) {
  User.create(req.body.response, function (err, user) {
    res.json(user);
  });
};

module.exports = routes;
