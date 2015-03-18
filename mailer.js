var nodemailer = require('nodemailer');
var config = require('./config').mail;
var fireBaseConfig = require('./config').firebase;
var util = require('util');
var Promise = require('bluebird');
var Firebase = require('firebase'); 


// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.email,
    pass: config.password
  }
});

var sendEmail = function(emailText) {
  if (!emailText){
    console.log('no text fetched');
    return;
  }
  var options = {
    from: 'cdepman@gmail.com',
    subject: 'TEST EMAIL FOR FORMATTING',
    text: util.format(emailText.text, 'Charlie'),
    html: util.format(emailText.html, 'Charlie'),
    to: 'cdepman@gmail.com'
  };
  return new Promise(function(resolve, reject) {
    transporter.sendMail(options, function(err, info) {
      if (err) {
        reject(err);
        return;
      }
      resolve(info);
      return;
    });
  });
};


var fetchEmailTextAndSend = function(){
  var emailTextDB = new Firebase(fireBaseConfig.dbAddress);
  emailTextDB.authWithCustomToken(fireBaseConfig.AUTH_TOKEN, function(error, result) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully!");
    }
  });

  var onComplete = function(error) {
    if (error) {
      console.log('Synchronization failed');
    } else {
      console.log('Synchronization succeeded');
    }
  };

  emailTextDB.child('/fullTime/emailB').once('value', function(data){
    console.log('Retrieved Data:', data.val());
    sendEmail(data.val());
  });
}

fetchEmailTextAndSend();