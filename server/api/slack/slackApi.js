var settings = require('../../settings');
var request = require('request');

var postInApp = function (post_data) {
    //set headers
    var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json'
    };
    // Configure the request
    var options = {
        url: settings.slack.webhookURL,
        method: 'POST',
        headers: headers,
        form: JSON.stringify(post_data)
    };

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('Message sent to slack');
        } else {
            console.log(error);
        }
    });
};

var sendJobStartMessage = function (obj) {
    var attachments = [
        {
            "fallback": "Notification for job started",
            "color": "#de9e31",
            "title": "Creative Dashboard",
            "title_link": "http://creative.xcelmg.com/",
            "fields": [
                {
                    "title": "JOB STARTED",
                    "value": obj.user + " has started the job " + obj.name,
                    "short": false
                }
            ]
        }
    ];
    //var message = "JOB STARTED\n>>>" +obj.user + ' has started the job '+ obj.job;
    postInApp({"attachments": attachments});
};

var approvalRequest = function (obj) {
    var attachments = [
        {
            "fallback": "Notification for job approval",
            "color": "#28d7e5",
            "title": "Creative Dashboard",
            "title_link": "http://creative.xcelmg.com/",
            "fields": [
                {
                    "title": "APPROVAL REQUEST",
                    "value": obj.user + " has requested approval for the job " + obj.name,
                    "short": false
                }
            ]
        }
    ];
    postInApp({attachments: attachments});
};

var approved = function (obj) {
    var attachments = [
        {
            "fallback": "Notification for job approved",
            "color": "#36a64f",
            "title": "Creative Dashboard",
            "title_link": "http://creative.xcelmg.com/",
            "fields": [
                {
                    "title": "APPROVED",
                    "value": obj.user + " has approved the job " + obj.name,
                    "short": false
                }
            ]
        }
    ];
    postInApp({attachments: attachments});
};

var backToQueue = function (obj) {
    var attachments = [
        {
            "fallback": "Notification for job moved back in the queue",
            "color": "#d50200",
            "title": "Creative Dashboard",
            "title_link": "http://creative.xcelmg.com/",
            "fields": [
                {
                    "title": "QUEUE",
                    "value": obj.user + " has moved the job " + obj.name + " back to queue",
                    "short": false
                }
            ]
        }
    ];
    postInApp({attachments: attachments});
};

var sendToVendor = function (obj) {
    var attachments = [
        {
            "fallback": "Notification for job sent to vendor",
            "color": "#4B6BC6",
            "title": "Creative Dashboard",
            "title_link": "http://creative.xcelmg.com/",
            "fields": [
                {
                    "title": "SEND VENDOR",
                    "value": obj.user + " has sent the job " + obj.name + " to vendor",
                    "short": false
                }
            ]
        }
    ];
    postInApp({attachments: attachments});
};

module.exports = {
    postInApp: postInApp,
    sendJobStartMessage: sendJobStartMessage,
    approvalRequest: approvalRequest,
    approved: approved,
    backToQueue: backToQueue,
    sendToVendor: sendToVendor
};



