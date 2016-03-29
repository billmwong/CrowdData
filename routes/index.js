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

module.exports = routes;
