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

var emailContentDB = new Firebase(fireBaseConfig.dbAddress);

emailContentDB.authWithCustomToken(fireBaseConfig.AUTH_TOKEN, function(error, result) {
  if (error) { console.log("Login Failed!", error); } 
  else { console.log("Authenticated successfully!"); }
});

var genAB = function(){
  var flip = false;
  return function(){
    flip = !flip;
    return flip ? 'emailA' : 'emailB';
  }
}
var ABGen = genAB();

var fetchEmailContent = function(emailType, callback){
  try {
    emailContentDB.child('/' + emailType + '/' + ABGen())
    .once('value', function(data){
      callback(data.val());
    });
  } catch(err) {
    console.log('DB Error! Error:', err);
  }
};

var sendFullTimeEmail = exports.sendFullTimeEmail = function(name, address) {
  fetchEmailContent('fullTime', function(data){
    var options = {
      from: 'cdepman@gmail.com',
      subject: 'Test Email',
      text: util.format(data.text, name),
      html: util.format(data.html, name),
      to: address
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
  });
};

var sendPartTimeEmail = exports.sendPartTimeEmail = function(name, address) {
  fetchEmailContent('partTime', function(data){
    var options = {
      from: 'cdepman@gmail.com',
      subject: 'Test Email',
      text: util.format(data.text, name),
      html: util.format(data.html, name),
      to: address
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
  });
};