var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// Create a Schema
var userSchema = mongoose.Schema({
  name: String,
  password: String,
  countryOfResidence: String,
  dateOfBirth: {  //unsure about this one
    year: Number,
    month: Number,
    day: Number,
  },
  Age: Number,
  timeCreated: Date,
  loggedin: Boolean,
});

userSchema.plugin(passportLocalMongoose);

var surveySchema = mongoose.Schema({
  author: String,  // containing user _id
  timeCreated: Date,
  questions: [{  // Short list of questions, max of 3 or 5
      id: Number,
      type: String,
      content: String,
      Answers: Array, // of strings
    },
  ],
  usersTaken: Array,  // of user _ids
});

var responseSchema = mongoose.Schema({
  survey: String,  //containing survey _id
  data: [{
    questionid: Number,
    response: Boolean,
  },
],
});

module.exports = {
  userModel:mongoose.model('user', userSchema),
  surveyModel: mongoose.model('survey', surveySchema),
  responseModel: mongoose.model('response', responseSchema),
};
