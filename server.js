var Scratch = require('scratch-api');
var fetch = require('node-fetch');
var isOnline = require('is-online');
var waitUntil = require('wait-until');
const fs = require('fs');
waitUntil(300, Infinity, function condition() {
    return isOnline();
}, function done(result) {
    Scratch.UserSession.create(process.env.SCRATCH_USERNAME, process.env.SCRATCH_PASSWORD, function(err, user) {
        user.cloudSession(process.env.MESSAGECOUNTID, function(err, cloud) {
            cloud.on('set', function(name, value) {
                if (name == '☁ Update') {
                    console.log('Update requested...')
                    cloud.set('☁ Update', 202);
                    fetch('https://api.scratch.mit.edu/users/' + process.env.SCRATCH_USERNAME + '/messages/count').then((res) => {
                        return res.json();
                    }).then((data) => {
                        console.log('API request succeeded...\nUpdating messages to ' + data.count +
                            '...');
                        cloud.set('☁ Messages', data.count);
                        cloud.set('☁ Update', 200);
                    }).catch((err) => {
                        cloud.set('☁ Update', 500);
                    })
                }
            })
            setInterval(function() {
                console.log('Automatic update triggered...');
                cloud.set('☁ Update', 202);
                fetch('https://api.scratch.mit.edu/users/' + process.env.SCRATCH_USERNAME + '/messages/count').then((res) => {
                    return res.json();
                }).then((data) => {
                    console.log('API request succeeded...\nUpdating messages to ' + data.count + '...');
                    cloud.set('☁ Messages', data.count);
                    cloud.set('☁ Update', 200);
                }).catch((err) => {
                    cloud.set('☁ Update', 500)
                })
            }, 180000)
        })
    })
});
