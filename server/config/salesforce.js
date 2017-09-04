// For salesforce connection
var jsforce = require('jsforce');
var settings = require('../settings');

var salesforce = new jsforce.Connection({
    loginUrl: settings.salesForce.loginUrl,
    instanceUrl: settings.salesForce.instanceUrl
});

salesforce.login(settings.salesForce.user, settings.salesForce.password, function (err, res) {
    if (err) {
        console.log('Error connecting to Salesforce [' + err + ']');
        return;
    }
    console.log('Connected to Salesforce (Sandbox)');
});

module.exports = salesforce;