var Scratch = require('scratch-api');
var fetch = require('node-fetch');
var isOnline = require('is-online');
var s2n = require('string2num');
var waitUntil = require('wait-until');
const fs = require('fs');
var username;
var testName;
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
              if (name == '☁ Username' && value != undefined) {
                waitUntil()
                  .interval(10)
                  .times(50)
                  .condition(function () {
                    return value != undefined;
                  });
                username = s2n.decode(value);
                console.log(username);
              }
                if (name == '☁ Update') {
                  testName = cloud.get('☁ Username');
                  waitUntil()
                  .interval(10)
                  .times(50)
                  .condition(function () {
                    return testName != undefined;
                  });
                    console.log('Update requested by ' + username + '(' + testName + ')');
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
        })
    })
});
