/*\
|*| Application configuration of environment variables.
|*|
\*/

module.exports = function () {
  var config = {};

  config.VIEW_DIR      = 'views';
  config.VIEW_ENGINE   = 'jade';
  config.STATIC_DIR    = 'static';
  config.PORT          = 1337;
  config.CACHE_ONE_DAY = 86400000;

  config.EMAIL_TEMPLATE_DIR      = '/templates';
  config.EMAIL_PROTOCOL          = 'SMTP';
  config.EMAIL_SERVICE           = 'Gmail';
  config.NOTIFICATION_EMAIL_FROM = 'orders.sluicegear@gmail.com';
  config.NOTIFICATION_EMAIL_TO   = 'bcdixon@outlook.com';

  return config;
};
