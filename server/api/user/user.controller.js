var passport = require('passport');
var User = require('./user.model');
var bcrypt = require('bcrypt-nodejs');

var signIn = function (req, res, next) {
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/signin'}, function(err, user, info) {
        if(err) {
            res.status('500');
            res.send({'message':err.message});
        }

        if(!user) {
            res.status('400');
            res.send({'message': info.message});
        }
        return req.logIn(user, function(err) {
            if(err) {
                res.status('404');
                res.send({'message': err.message});
            } else {
                res.status('200');
                res.send({
                    'message': 'log in success',
                    'username': user.display,
                    'email' : user.username
                });
            }
        });
    })(req, res, next);
};

var signUp = function (req, res, next) {
    var user = req.body;
    return new User({username: user.username}).fetch().then(function(model) {
        if(model) {
            res.status('400');
            res.send({'message':'Username already exist'});
        } else {
            var password = user.password;
            var hash = bcrypt.hashSync(password);

            var signUpUser = new User({username: user.username, password: hash});

            signUpUser.save().then(function(model) {
                // sign in the newly registered user
                signIn(req, res, next);
            }).catch(function(err){
                debugger;
            });
        }
    });
};

var getUser = function(req,res) {
    return res.send(req.user);
};

var logout = function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
};

module.exports = {
    signIn: signIn,
    signUp: signUp,
    getUser: getUser,
    logout: logout
};
