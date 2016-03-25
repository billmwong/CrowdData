var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var index = require("./routes/index");

var app = express();

var MONGOURI = process.env.MONGOURI || "mongodb://localhost/CrowdData";
var PORT = process.env.PORT || 3000;

mongoose.connect(MONGOURI);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false ,
  cookie: {}
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", index.home);

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    if(!err) done(null, user);
    else done(err, null);
  });
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.listen(PORT, function () {
  console.log("Application running on port:", PORT);
});

// module.exports = app;
