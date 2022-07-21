const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');
// ???? ——————————————————————————————————————————————————————————————————————————————————
const routes = require('./routes');
const { environment } = require('./config');
const isProduction = environment === 'production';
// ???? ——————————————————————————————————————————————————————————————————————————————————
// todo ——————————————————————————————————————————————————————————————————————————————————
// todo                               App
// todo ——————————————————————————————————————————————————————————————————————————————————
const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
if (!isProduction) app.use(cors()); // enable cors only in development
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"})); // helmet helps set a variety of headers to better secure your app
app.use(csurf({cookie: {secure: isProduction, sameSite: isProduction && "Lax", httpOnly: true}})); // Set the _csrf token and create req.csrfToken method
app.use(routes); // Connect all the routes

// ???? ——————————————————————————————————————————————————————————————————————————————————
// todo ——————————————————————————————————————————————————————————————————————————————————
// todo                               Error Handling Middleware
// todo ——————————————————————————————————————————————————————————————————————————————————
app.use((_req, _res, next) => { // Catch unhandled requests and forward to error handler.
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

app.use((err, _req, _res, next) => { // Process sequelize errors
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = 'Validation error';
  }
  next(err);
});

app.use((err, _req, res, _next) => { // Format errors
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

// ???? ——————————————————————————————————————————————————————————————————————————————————
module.exports = app;