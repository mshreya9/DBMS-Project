// requiring modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// env config
require('dotenv').config();
const app = express();

// requiring local modules
const auth = require('./Routes/auth');



// presets
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// port declaration
const port = process.env.PORT || 3000;

// open routes
app.use('/auth', auth);


// Init the server
app.listen( port, () => {})
