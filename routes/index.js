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

routes.getSurvey = function (req, res) {
  // Get request that needs to respond with a json containing logged-in
  // user and a survey object the user has not completed.
  Survey.find({ usersTaken: { $nin: [req.user._id] } }, function (err, surveys) {
    // chooses a random survey to send to the user.
    randomIndex = Math.floor((Math.random() * surveys.length));
    res.json({ user: req.user, survey:surveys[randomIndex] });
  });
};

var handleResponses = function (res, err, responses) {
  console.log(JSON.stringify(responses));
  // return function () {
  // };
  res.json({success:true});
};

/**
 * Gets all the responses for all the surveys that this user has created.
 */
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
    // for (var i=0; i<thisUsersSurveys.length; i++) {
    //   console.log('finding responses for this survey: '+thisUsersSurveys[i].title);
    //   // Response.find({survey: thisUsersSurveys[i]._id}, handleResponses);
    //   Response.find({}, handleResponses);
    // }
  });
};

routes.submitSurvey = function (req, res) {
  // Post request containing survey _id, response object, and user _id.
  // The response should be added to the response collection and the survey
  // should be added to the user object as a completed survey.
  // res contains response object.

  Survey.findOneAndUpdate({ _id:req.body.survey_id }, { $push: { 'usersTaken': req.body.user_id }}, function(err, survey){
    console.log("survey:", survey);
    if (err){
      console.log(err);
      res.status(500);
    } else{
        User.findOneAndUpdate({_id:req.body.user_id}, { $push: {'surveysTaken': req.body.survey_id }}, function(err, user){
          console.log("user:", user);
          if (err){
            console.log(err);
            res.status(500);
          } else {
            res.json(req.body.response);
          }
        }
      );
    }
  });

  // Response.create(req.body.response, function (err, response) {
  //   console.log('req.body.response:', req.body.response);
  //   res.json(response);
  // });
};

routes.newSurvey = function (req, res) {
  // Post request containing a survey object to be added to the survey collection.
  Survey.create(req.body, function (err, survey) {
    console.log(survey);
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
