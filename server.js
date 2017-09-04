var express = require("express");
var app = express();
var port = process.env.PORT || 3001;
var passport = require('passport');
var settings = require('./server/settings');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

// read cookies (needed for auth)
app.use(cookieParser());
// get information from html forms
app.use(bodyParser());

// required for passport
app.use(session({ secret: settings.passport.secret , cookie: { maxAge: settings.passport.maxAge }})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

require('./server/config/passport')(passport); // pass passport for configuration
require('./server/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//server the Angular app folder as main root folder
app.use(express.static(__dirname + '/app'));

//default route for hashbang on page refresh
app.get('/*', isLoggedIn, function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

//start the server as well as socket listen at the same time
var io = require('socket.io').listen(app.listen(port));
require('./server/api/socketio')(io);

console.log('Started on port ' + port);


