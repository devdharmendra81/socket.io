var util = require('util');
var nodemailer = require('nodemailer');
var settings = require('../settings');
var ArtistModel = require('./artist/artist.model');
var moment = require('moment-timezone');
var slack = require('./slack/slackApi');

//handle salesforce event
var salesForce = require('../../server/config/salesforce');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: settings.email.user,
        pass: settings.email.password
    }
});

module.exports = function (io) {
    var data = {};

    io.on('connection', function (socket) {
        console.log('---Socket connection established');

        socket.on('dashboard:getData', function () {
            io.emit('dashboard:getData', data);
        });

        socket.on('update_queue', function (job) {
            console.log(util.inspect(job, false, null));
            update_queue(job);
        });

        socket.on('send_approval', function (job) {
            console.log(util.inspect(job, false, null));
            send_approval(job);
        });

        socket.on('send_queue', function (job) {
            console.log(util.inspect(job, false, null));
            send_queue(job);
        });

        socket.on('approve_queue', function (job) {
            console.log(util.inspect(job, false, null));
            approve_queue(job);
        });

        socket.on('send_vendor', function (job) {
            console.log(util.inspect(job, false, null));
            send_vendor(job);
        });

        socket.on('socket:end', function () {
            socket.disconnect();
        });

        socket.on('disconnect', function () {
            console.log('---Socket disconnected');
        });
    });

    var x = 0, interval = 10000; //10 seconds
    setInterval(function () {
        x++;
        push_data();
        console.log("Polling: [" + x + "] ( 10 seconds )");
    }, interval);

    function push_data(socket) {
        //query functions
        queue();
        active();
        pending_approval();
        approved();
        live_proof();
        prize_board();
    }

    function queue() {
        console.log('Method: queue');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name,Artist__c, Artist_Email__c, Account__r.Name, Queue_Time__c, Account_Manager__c,' +
                'Project_Type__c, Piece_Type__c, Approve_By_Date__c')
            .where("Status__c = 'Queue'")
            .orderby("Queue_Time__c", "ASC")
            .orderby("Approve_By_Date__c", "ASC")
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['queue'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function active() {
        console.log('Method: active');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name, Account__r.Name, Status__c, Queue_Time__c, Account_Manager__c, Artist__c, Artist_Email__c, ' +
                'Project_Type__c, Piece_Type__c, Approve_By_Date__c')
            .where("Status__c = 'In Creative'")
            .orderby("Artist__c", "ASC")
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['active'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function pending_approval() {
        console.log('Method: pending_approval');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name, Account__r.Name, Status__c, Account_Manager__c, Artist__c, Artist_Email__c, ' +
                'Project_Type__c, Piece_Type__c, Revision__c')
            .where("Status__c = 'Waiting for Approval'")
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['pending_approval'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function approved() {
        console.log('Method: approved');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name, Account__r.Name, Vendor__c, Status__c, Due_Date__c')
            .where("Status__c = 'Approved'")
            .orderby('Due_Date__c', 'ASC')
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['approved'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function live_proof() {
        console.log('Method: live_proof');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name, Account__r.Name, Stage__c, Account_Manager__c, Artist__c, ' +
                'Artist_Email__c, Project_Type__c, Piece_Type__c, Vendor__c, Due_Date__c')
            .where("Status__c = 'Pending at Vendor'")
            .orderby("Due_Date__c", "ASC")
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['live_proof'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function prize_board() {
        console.log('Method: prize_board');
        salesForce.sobject("Projects__c")
            .select('Id, Name, Account__r.Parent.Name, Account__r.Name, Vendor__c, Status__c, Begin_Date__c')
            .where("Prize_Banner_New__c = 'Pending'")
            .orderby("Begin_Date__c", "ASC")
            .execute(function (err, records) {
                if (err) {
                    return console.error(err);
                }
                data['prize_board'] = records;
                io.emit('dashboard:getData', data);
            });
    }

    function update_queue(job) {
        console.log('Inside updated_queue, job: ' + job['job']);
        //check if the artist already has a job in creative queue
        salesForce.sobject("Projects__c")
            .select('Id, Name, Artist__c')
            .where({
                Status__c: 'In Creative',
                Artist_Email__c: job['email']
            }).execute(function (err, records) {
            if (err) {
                console.log(err);
                io.emit('response:error', err);
            }else if(records.length !== 0){ //job is in active (creative) state
                var data = records[0];
                io.emit('response:error',{
                    message:'Cannot work on 2 jobs at the same time, job# '+data.Name+' is already in progress'
                });
            }else{
                //add the job in creative for this artist
                salesForce.sobject("Projects__c").update({
                    Id: job['job'],
                    Status__c: 'In Creative',
                    Artist__c: job['user'],
                    Artist_Email__c: job['email']
                }, function (err, ret) {
                    if (err || !ret.success) {
                        return console.error(err);
                    }
                    var modelData = {
                        artistName:job['user'],
                        artistEmail: job['email'],
                        jobId : job['job'],
                        startTime : getTzDateTime()
                    };
                    //save the time job was started
                    saveJobTime(modelData);
                    //send notification on slack
                    slack.sendJobStartMessage(job);
                    console.log('Updated: ' + ret.id);
                    x++;
                    push_data();
                });
            }
        });
    }

    function send_approval(job) {
        console.log('Inside updated_queue, job: ' + job['job']);
        salesForce.sobject("Projects__c").update({
            Id: job['job'],
            Status__c: 'Waiting for Approval'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err);
            }
            var modelData = {
                artistName:job['user'],
                artistEmail: job['email'],
                jobId : job['job'],
                endTime : getTzDateTime()
            };
            updateJobTime(modelData);
            slack.approvalRequest(job);
            console.log('Updated: ' + ret.id);
            x++;
            push_data();
        });
    }

    function send_queue(job) {
        console.log('Inside send_queue, job: ' + job['job']);
        var jobId =  job['job'],
            user = job['user'],
            email = job['email'],
            revisionCount,
            data = {
                    Id: jobId,
                    Status__c: 'Queue'
                };
        if(job['Revision__c']){
            revisionCount = job['Revision__c'];
            revisionCount++;
            data['Revision__c'] = revisionCount;
        }
        salesForce.sobject("Projects__c").update(data, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err);
            }
            var modelData = {
                artistName:user,
                artistEmail: email,
                jobId : jobId,
                endTime : getTzDateTime()
            };
            updateJobTime(modelData);
            slack.backToQueue(job);
            console.log('Updated: ' + ret.id);
            x++;
            //console.log("[" + x + "] ((( 30 seconds )))");
            push_data();
        });
    }

    function approve_queue(job) {
        console.log('Inside approve_queue, job: ' + job['job']);
        salesForce.sobject("Projects__c").update({
            Id: job['job'],
            Status__c: 'Approved'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err);
            }
            console.log('Updated: ' + ret.id);
            x++;
            //console.log("[" + x + "] ((( 30 seconds )))");
            slack.approved(job);
            push_data();
        });
    }

    function send_vendor(job) {
        console.log('Inside send_vendor, job: ' + job['job']);
        salesForce.sobject("Projects__c").update({
            Id: job['job'],
            Status__c: 'Pending at Vendor'
        }, function (err, ret) {
            if (err || !ret.success) {
                return console.error(err);
            }
            sendEmail();
            console.log('Updated: ' + ret.id);
            x++;
            slack.sendToVendor(job);
            push_data();
        });
    }

    function sendEmail() {
        console.log('sending email...');
        var mailOptions = {
            from: settings.email.from,
            to: 'tom@gmail.com',
            subject: 'Test Email',
            text: 'Hurray! It works'
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }

    function getTzDateTime() {
        return moment().tz(settings.timeZone).format('YYYY-MM-DD HH:mm:ss');
    }

    function saveJobTime(data) {
        new ArtistModel.JobTime(data).save().then(function(model) {
            console.log('Saved start time for job- '+data.jobId);
        });
    }

    function updateJobTime(data) {
        new ArtistModel.JobTime({jobId:data.jobId, endTime:null}).fetch().then(function (model) {
            if (model) {
                model.set('endTime', data.endTime);
                console.log('Saved end time for job- '+data.jobId);
                return model.save();
            }
        });
    }
};