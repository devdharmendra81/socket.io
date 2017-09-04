var express = require('express');
var controller = require('./user.controller');

var router = express.Router();

router.post('/signin', controller.signIn);
router.post('/signup', controller.signUp);
router.get('/me', controller.getUser);
router.get('/logout', controller.logout);

module.exports = router;