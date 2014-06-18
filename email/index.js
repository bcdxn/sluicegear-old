'use strict';

var nodemailer     = require('nodemailer'),
    emailTemplates = require('email-templates'),
    Config         = require('../config'),
    CONFIG         = new Config();

exports.sendOrderEmail = function (locals) {
  console.log('SENDING EMAIL: ' + CONFIG.NOTIFICATION_EMAIL_TO);
  emailTemplates(__dirname + CONFIG.EMAIL_TEMPLATE_DIR, function (tempErr, template) {
    var transport;
    
    if (tempErr) {
      console.log('ERROR: order notification not sent -- ' + tempErr);
      return;
    }

    transport = nodemailer.createTransport(CONFIG.EMAIL_PROTOCOL, {
      service: CONFIG.EMAIL_SERVICE,
      auth: {
        user: CONFIG.NOTIFICATION_EMAIL_FROM,
        pass: process.env.SLUICE_NOTIFICATION_EMAIL_FROM_PWD
      }
    });

    template('order', locals, function(tempCompileErr, html, text) {
      if (tempCompileErr) {
        console.log('ERROR: order notification not sent -- '  + tempCompileErr);
      } else {
        transport.sendMail({
          // 'from': '<news.sluice@gmail.com>',
          'from': '<' + CONFIG.NOTIFICATION_EMAIL_FROM + '>',
          'to': CONFIG.NOTIFICATION_EMAIL_TO,
          'subject': 'New Order -- ' + locals.createdTime,
          'html': html
        }, function(err, responseStatus) {
          if (err) {
            console.log('ERROR: order notification not sent -- '  + tempCompileErr);
          } else {
            console.log('NOTIFICATION EMAIL SENT: ' + responseStatus.message);
          }
        });
      }
    });
  });
};