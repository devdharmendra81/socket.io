var LocalStrategy = require('passport-local').Strategy;
var User = require('../api/user/user.model');
var bcrypt = require('bcrypt-nodejs');

module.exports = function (passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {
        new User({username: username}).fetch().then(function(user) {
            done(null, user);
        });
    });

    passport.use(new LocalStrategy(function(username, password, done) {
        new User({username: username}).fetch().then(function(data) {
            var user = data;
            if(user === null) {
                return done(null, false, {message: 'Invalid username'});
            } else {
                user = data.toJSON();
                if(!bcrypt.compareSync(password, user.password)) {
                    return done(null, false, {message: 'Invalid password'});
                } else {
                    return done(null, user);
                }
            }
        });
    }));
};
