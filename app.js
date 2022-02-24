var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
// var validator = require('express-validator');
var mongoStore = require('connect-mongo');

var index = require('./routes/index');
var userRoutes = require('./routes/user');

var app = express();

const dbUri = "mongodb+srv://mlabsu:mlabpass@cluster0.3dkfe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.Promise = global.Promise;

// Connect to Database
mongoose.connect(dbUri, {useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  err? console.log(err) : console.log('Connected to DB');
});
// mongoose.connect('localhost:27017/shopping');
require('./config/passport');

// view engine setup
app.engine('.hbs',expressHbs.engine({defaultLayout : 'layout' , extname : '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { check, validationResult } = require('express-validator');

app.post('/user', [
  check('username').isEmail(),
  check('password').isLength({ min: 5 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // create/update the user however you want?
});


// app.use(validator());
app.use(cookieParser());
app.use(session({
  secret : 'mysupersecret',
  resave : false,
  saveUninitialized : false,
  store: mongoStore.create({mongoUrl: dbUri}),
  cookie : { maxAge: 180 * 60 * 1000}
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/user', userRoutes);
app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Set server host and port
const host = '0.0.0.0';
const port = process.env.PORT || 1080;


// Start Server
app.listen(port, host, () => {
  console.log('Server listening on port ' + port + '...');
});


module.exports = app;
