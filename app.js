const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const engine = require('ejs-locals');
const flash = require('connect-flash');
const session = require('express-session');
require('dotenv').config();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000
  }
}));
app.use(flash());

// set routes
const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const auth = require('./routes/auth');
const checkAuth = ((req, res, next) => {
  if(req.session.uid === process.env.ADMIN_UID) {
    return next();
  }
  return res.redirect('/auth/signin');
});

app.use('/', index);
app.use('/dashboard', checkAuth, dashboard);
app.use('/auth', auth);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
  res.render('error', {
    errorMessage: '您所查看的頁面不存在 ：('
  });
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
