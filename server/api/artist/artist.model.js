var DB = require('../../database').DB;

var JobTime = DB.Model.extend({
    tableName: 'jobtime',
    idAttribute: 'id'
});

module.exports = {
    JobTime : JobTime
};