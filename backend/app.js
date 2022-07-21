const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
// ???? ——————————————————————————————————————————————————————————————————————————————————
const routes = require('./routes');
const { environment } = require('./config');
const isProduction = environment === 'production';
// ???? ——————————————————————————————————————————————————————————————————————————————————

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
if (!isProduction) app.use(cors()); // enable cors only in development
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"})); // helmet helps set a variety of headers to better secure your app
app.use(csurf({cookie: {secure: isProduction, sameSite: isProduction && "Lax", httpOnly: true}})); // Set the _csrf token and create req.csrfToken method
app.use(routes); // Connect all the routes



// ???? ——————————————————————————————————————————————————————————————————————————————————
module.exports = app;