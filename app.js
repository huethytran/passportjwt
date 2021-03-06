var express = require('express');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session =  require('express-session');
var index = require('./routes/index');
var me = require('./routes/me');
var auth = require('./routes/auth');
const passport    = require('passport');
require('dotenv').config();

require('./config/passport')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// các cài đặt cần thiết cho passport
app.use(session({secret: process.env.SECRET_KEY})); // chuối bí mật đã mã hóa coookie
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Methods", 'GET,HEAD,OPTIONS,POST,PUT');
  res.header("Access-Control-Allow-Headers", 'Origin, Access-Control-Allow-Methods, X-Requested-With, Content-Type, Accept, Authorization ');
  next();
});
var corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));
app.use('/', index);
app.use('/me', passport.authenticate('jwt', {session: false}), me);
app.use('/user', auth);

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
  res.status(err.status || 500).send("error");
});


module.exports = app;