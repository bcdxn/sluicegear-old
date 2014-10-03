/*\
|*|
|*| Node application entry point. This js initalizes and starts
|*| the express server.
|*|
\*/

/* Imports
------------------------------------------------------------------------------*/
var Config  = require('./config'),
  express   = require('express'),
  routes    = require('./routes'),
  http      = require('http'),
  path      = require('path');

/* Instantiate Express Application
------------------------------------------------------------------------------*/
var app  = express(),
  CONFIG = new Config();

/* Configure Express Application
------------------------------------------------------------------------------*/
app.set('port', process.env.PORT || CONFIG.PORT)
  .set('views', path.join(__dirname, CONFIG.VIEW_DIR))
  .set('view engine', CONFIG.VIEW_ENGINE)
  .use(express.logger(CONFIG.LOGGER_MODE))
  .use(express.compress())
  .use(express.json())
  .use(express.urlencoded())
  .use(express.methodOverride())
  .use(express.static(path.join(__dirname, CONFIG.STATIC_DIR), {maxAge: CONFIG.CACHE_ONE_DAY}))
  .use(express.cookieParser())
  .use(express.session({'secret': process.env.SLUICE_SESSION_PWD}));

/* Log and exit on all uncaught exceptions
------------------------------------------------------------------------------*/
process.on('uncaughtException', function(err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});


/* Handle page requests
------------------------------------------------------------------------------*/
app.get('/', routes.landing);
app.get('/shop', routes.shop);
app.get('/order', routes.order);
app.get('/orderApprove', routes.orderApprove);
app.get('/orderExecute', routes.orderExecute);
app.get('/thankyou', routes.thankyou);
app.post('/coupon', routes.coupon);
app.get('*', routes.fourOhFour);

/* Start Server
------------------------------------------------------------------------------*/
http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server started listening on port: ' + app.get('port'));
});
