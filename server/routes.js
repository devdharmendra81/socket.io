module.exports = function(app, passport) {
    app.use('/api/user', require('./api/user'));
};
