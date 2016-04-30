var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = mongoose.Schema({
  name: String,
  password: String,
  countryOfResidence: String,
  dateOfBirth: {
    year: Number,
    month: Number,
    day: Number,
  },
  age: Number,
  timeCreated: Date,
  surveysTaken: [{type: ObjectId, ref: 'Survey'}],
});

userSchema.plugin(passportLocalMongoose);

var surveySchema = mongoose.Schema({
  author: String,  // containing user _id
  timeCreated: Date,
  category: String,
  demographics: Array,
  title: String,
  hypothesis: String,
  questions: Array,
  //question format:
  // questions: [{
  //     id: Number,
  //     type: String,
  //     content: String,
  //     responses: {}
  //   }
  // ],
  options: Object,
  usersTaken: [{type: ObjectId, ref: 'User'}],  // containing user _ids
});

var responseSchema = mongoose.Schema({
  survey: String,  //containing survey _id
  data: [{
    questionid: Number,
    response: String,
  },
],
});

module.exports = {
  userModel:mongoose.model('user', userSchema),
  surveyModel: mongoose.model('survey', surveySchema),
  responseModel: mongoose.model('response', responseSchema),
};
