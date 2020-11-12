var Scratch = require('scratch-api');
var fetch = require('node-fetch');
var isOnline = require('is-online');
var s2n = require('string2num');
var waitUntil = require('wait-until');
const fs = require('fs');
var username;
waitUntil()
  .interval(300)
  .times(Infinity)
  .condition(function () {
    return isOnline();
})
.done(function(result) {
    Scratch.UserSession.create(process.env.SCRATCH_USERNAME, process.env.SCRATCH_PASSWORD, function(err, user) {
        user.cloudSession(process.env.MESSAGECOUNTID, function(err, cloud) {
            cloud.on('set', function(name, value) {
                if (name == '☁ Update') {
                    console.log('Update requested...');
                    username = s2n.decode(cloud.get('☁ Username'));
                    cloud.set('☁ Update', 202);
                    fetch('https://api.scratch.mit.edu/users/' + username + '/messages/count').then((res) => {
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
                username = s2n.decode(cloud.get('☁ Username'));
                fetch('https://api.scratch.mit.edu/users/' + username + '/messages/count').then((res) => {
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
