var DB = require('../../database').DB;

var User = DB.Model.extend({
    tableName: 'tblUsers',
    idAttribute: 'userId'
});

module.exports =  User;